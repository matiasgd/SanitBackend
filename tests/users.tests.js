const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);
const app = require("../server");
const { Users, Patients } = require("../db_models");

describe("User Controller", () => {
  beforeEach(async () => {
    // Crea usuarios en la base de datos para las pruebas
    const user1 = new Users({
      email: "user1@example.com",
      password: "password1",
    });
    await user1.save();

    const user2 = new Users({
      email: "user2@example.com",
      password: "password2",
    });
    await user2.save();

    const patient1 = new Patients({
      name: "Paciente 1",
      lastName: "Apellido 1",
      email: "patient1@email.com",
    });
    patient1.doctors.push(user1._id);
    await patient1.save();

    const patient2 = new Patients({
      name: "Paciente 2",
      lastName: "Apellido 2",
      email: "patient2@email.com",
    });
    patient2.doctors.push(user2._id);
    await patient2.save();
    user1.patients.push(patient1._id, patient2._id);
    await user1.save();
  });

  afterEach(async () => {
    // Elimina los usuarios creados en la base de datos después de las pruebas
    await Users.deleteMany({});
    await Patients.deleteMany({});
  });

  // -----------------  PRUEBAS PEDIDO GET ----------------- //

  // GET GENERAL
  describe("GET /users", () => {
    it("debería obtener todos los usuarios", async () => {
      const res = await chai.request(app).get("/api/users");

      expect(res).to.have.status(201);
      expect(res.body.users).to.be.an("array");
    });
  });

  // GET POR ID
  describe("GET /users/:_id", () => {
    it("debería obtener un usuario por su ID", async () => {
      const user = await Users.findOne();
      const id = user._id.toString();
      const res = await chai.request(app).get(`/api/users/${id}`);
      expect(res).to.have.status(201);
      expect(res.body).to.be.an("object");
      expect(res.body.user._id).to.equal(id);
    });

    it("debería devolver un mensaje de error si el ID enviado no tiene el formato correcto", async () => {
      const res = await chai.request(app).get("/api/users/123456789");
      expect(res).to.have.status(400);
      expect(res.body).to.be.an("object");
      expect(res.body.message).to.equal(
        "Formato de ID inválido: El ID proporcionado no tiene el formato ObjectId válido."
      );
    });

    it("debería devolver un mensaje de error si el ID no se encuentra en la base de datos", async () => {
      const id = "00000c5b099d75204c5ccb00"; // ID Editado para que no exista en la DB
      const res = await chai.request(app).get(`/api/users/${id}`);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("El usuario no existe");
    });
  });

  // GET DOCTOR PATIENTS
  describe("GET /users/patients/:_id", () => {
    it("debería obtener los pacientes de un doctor", async () => {
      const user = await Users.findOne(); // Obtén un doctor existente de la base de datos
      const id = user._id.toString(); // Obtén el ID de un doctor
      const res = await chai.request(app).get(`/api/users/patients/${id}`);
      expect(res).to.have.status(201);
      expect(res.body.data).to.be.an("array");
      expect(res.body.data.length).to.equal(2);
    });

    it("debería devolver un mensaje de error si el ID enviado no tiene el formato correcto", async () => {
      const res = await chai.request(app).get(`/api/users/patients/123456789`);
      expect(res).to.have.status(400);
      expect(res.body).to.be.an("object");
      expect(res.body.message).to.equal(
        "Formato de ID inválido: El ID proporcionado no tiene el formato ObjectId válido."
      );
    });

    it("debería devolver un mensaje de error si el ID no se encuentra en la base de datos", async () => {
      const id = "00000c5b099d75204c5ccb00"; // ID Editado para que no exista en la DB
      const res = await chai.request(app).get(`/api/users/patients/${id}`);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("El usuario no existe");
    });

    it("debería devolver un mensaje de error si el doctor no tiene pacientes asociados", async () => {
      const user = await Users.findOne({ email: "user2@example.com" }); // Obtén un doctor existente de la base de datos
      const id = user._id.toString(); // Obtén el ID de un doctor
      const res = await chai.request(app).get(`/api/users/patients/${id}`);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("No se encontraron pacientes");
    });
  });

  // -----------------  PRUEBAS PEDIDO POST ----------------- //

  // CREAR UN USUARIO
  describe("POST /api/users/new", () => {
    it("debería crear un nuevo usuario", async () => {
      const newUser = {
        email: "newuser@gmail.com",
        password: "123456789",
      };
      const res = await chai.request(app).post("/api/users/new").send(newUser);
      expect(res).to.have.status(201);
      expect(res.body.message).to.equal("El usuario fue creado correctamente!");
    });

    it("debería devolve un error si falta el email o el password", async () => {
      const newUser = {
        email: "newuser@gmail.com",
      };
      const res = await chai.request(app).post("/api/users/new").send(newUser);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal(
        "La información de los campos para la creación de una cuenta es incorrecta."
      );
    });

    it("la contraseña deberia tener por lo menos 8 caracteres.", async () => {
      const newUser = {
        email: "newuser@gmail.com",
        password: "1234567",
      };
      const res = await chai.request(app).post("/api/users/new").send(newUser);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal(
        "La contraseña debe tener al menos 8 caracteres."
      );
    });

    it("la contraseña no puede tener caracteres especiales.", async () => {
      const newUser = {
        email: "newuser@gmail.com",
        password: "1234567!",
      };
      const res = await chai.request(app).post("/api/users/new").send(newUser);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal(
        "La contraseña no puede contener caracteres especiales."
      );
    });

    it("validar si el email ya se encuentra registrado.", async () => {
      const newUser = {
        email: "user1@example.com",
        password: "12345678",
      };
      const res = await chai.request(app).post("/api/users/new").send(newUser);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("El email ya está registrado.");
    });
  });

  // TERMINAR DE COMPLETAR EL PERFIL DE UN USUARIO
  describe("POST /api/users/complete/:doctorId", () => {
    it("debería crear un nuevo usuario", async () => {
      const user = await Users.findOne();
      const id = user._id.toString(); // Obtén el ID de un doctor
      const userDTO = {
        name: "John",
        lastName: "Doe",
        gender: "Male",
        cellphone: "1234567890",
        birthdate: "1990-01-01",
        field: "Medicine",
        specialty: "Cardiology",
      };
      const res = await chai
        .request(app)
        .post(`/api/users/complete/${id}`)
        .send(userDTO);
      expect(res).to.have.status(201);
      expect(res.body.message).to.equal(
        "El usuario se ha actualizado correctamente"
      );
    });

    it("El usuario ya completo su perfil", async () => {
      const user = await Users.findOne();
      const id = user._id.toString();
      user.profileCompleted = true;
      await user.save();
      const userDTO = {
        name: "John",
        lastName: "Doe",
        gender: "Male",
        cellphone: "1234567890",
        birthdate: "1990-01-01",
        field: "Medicine",
        specialty: "Cardiology",
      };
      const res = await chai
        .request(app)
        .post(`/api/users/complete/${id}`)
        .send(userDTO);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("El usuario ya completó su registro");
    });
  });

  // TERMINAR DE COMPLETAR EL PERFIL DE UN USUARIO
  describe("PUT /api/users/update/:userId", () => {
    it("debería crear un nuevo usuario", async () => {
      const user = await Users.findOne();
      const id = user._id.toString(); // Obtén el ID de un doctor
      const userDTO = {
        birthdate: "1992-01-01",
      };
      const res = await chai
        .request(app)
        .put(`/api/users/update/${id}`)
        .send(userDTO);
      expect(res).to.have.status(201);
      expect(res.body.message).to.equal("Usuario actualizado exitosamente");
    });

    it("debería devolver un mensaje de error si el ID enviado no tiene el formato correcto", async () => {
      const res = await chai.request(app).put(`/api/users/update/123456789`);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal(
        "Formato de ID inválido: El ID proporcionado no tiene el formato ObjectId válido."
      );
    });

    it("debería devolver un mensaje de error si no se proporcionaron los campos correctos", async () => {
      const user = await Users.findOne();
      const id = user._id.toString(); // Obtén el ID de un doctor
      const userDTO = {
        date: "1992-01-01",
      };
      const res = await chai
        .request(app)
        .put(`/api/users/update/${id}`)
        .send(userDTO);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal(
        "Al menos uno de los campos proporcionados no es actualizable"
      );
    });
  });
  // ELIMINAR UN USUARIO
  describe("DELETE api/users/delete/:_id", () => {
    it("debería eliminar al usuario", async () => {
      const user = await Users.findOne();
      const id = user._id.toString(); // Obtén el ID de un doctor
      const res = await chai.request(app).delete(`/api/users/delete/${id}`);
      expect(res).to.have.status(201);
      expect(res.body.message).to.equal(
        "El usuario se ha eliminado correctamente"
      );
    });

    it("debería devolver un mensaje de error si el ID enviado no tiene el formato correcto", async () => {
      const res = await chai.request(app).delete(`/api/users/delete/123456789`);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal(
        "Formato de ID inválido: El ID proporcionado no tiene el formato ObjectId válido."
      );
    });

    it("debería devolver un mensaje de error si el usuario no existe", async () => {
      const id = "00000c5b099d75204c5ccb00"; // ID Editado para que no exista en la DB
      const res = await chai.request(app).delete(`/api/users/delete/${id}`);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("El usuario no existe");
    });
  });

  // BORRAR UN PACIENTE DE UN DOCTOR
  describe("DELETE api/users/:userId/patient/:patientId", () => {
    it("debería eliminar al usuario", async () => {
      const user = await Users.findOne();
      const userId = user._id.toString(); // Obtén el ID de un doctor
      const patient = await Patients.findOne();
      const patientId = patient._id.toString(); // Obtén el ID de un paciente
      const res = await chai
        .request(app)
        .delete(`/api/users/${userId}/patients/${patientId}`);
      expect(res).to.have.status(201);
      expect(res.body.message).to.equal(
        "El paciente se ha eliminado correctamente"
      );
      expect(res.body.removedDoctor._id).to.equal(userId);
    });

    it("debería devolver un mensaje de error si el ID enviado no tiene el formato correcto", async () => {
      const user = await Users.findOne();
      const userId = user._id.toString(); // Obtén el ID de un doctor
      const res = await chai
        .request(app)
        .delete(`/api/users/${userId}/patients/12345678`);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal(
        "Formato de ID inválido: El ID proporcionado no tiene el formato ObjectId válido."
      );
    });

    it("debería devolver un mensaje de error si el ID enviado no tiene el formato correcto", async () => {
      const patient = await Patients.findOne();
      const patientId = patient._id.toString(); // Obtén el ID de un paciente
      const res = await chai
        .request(app)
        .delete(`/api/users/12345678/patients/${patientId}`);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal(
        "Formato de ID inválido: El ID proporcionado no tiene el formato ObjectId válido."
      );
    });

    it("debería devolver un mensaje de error si el usuario no existe", async () => {
      const patient = await Patients.findOne();
      const patientId = patient._id.toString(); // Obtén el ID de un paciente
      const userId = "00000c5b099d75204c5ccb00"; // ID Editado para que no exista en la DB
      const res = await chai
        .request(app)
        .delete(`/api/users/${userId}/patients/${patientId}`);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("El usuario no existe");
    });

    it("debería devolver un mensaje de error si el paciente no esta asociado al medico", async () => {
      const patient = await Patients.findOne({ email: "patient2@email.com" });
      const patientId = patient._id.toString(); // Obtén el ID de un paciente
      const user = await Users.findOne();
      const userId = user._id.toString();
      const res = await chai
        .request(app)
        .delete(`/api/users/${userId}/patients/${patientId}`);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal(
        "El médico no está asociado a este paciente"
      );
    });
  });
});
