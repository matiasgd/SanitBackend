const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);
const app = require("../server");
const { Users, Patients, Services } = require("../db_models");
const mongoose = require("mongoose");
const { describe } = require("mocha");

describe("Patient Controller", () => {
  let userId; // Variable para almacenar el ID del usuario  

  beforeEach(async () => {
    // Crear un nuevo usuario
    const newUser = new Users({
      email: "jrichards@gmail.com",
      password: "7up2024",
      name: "James",
      lastName: "Richards",
      gender: "Masculino",
      country: "Argentina",
    });
    await newUser.save();
    userId = newUser._id; // Almacenar el ID del usuario creado

    // Crear algunos pacientes relacionados con el usuario
    const patients = [
      {
        name: "Paciente 1",
        lastName: "Apellido 1",
        birthdate: new Date("1990-01-01"),
        govermentId: "35808054",
        email: "paciente1@gmail.com",
        doctors: [userId],
      },
      {
        name: "Paciente 2",
        lastName: "Apellido 2",
        birthdate: new Date("1995-02-02"),
        govermentId: "35808055",
        email: "paciente2@gmail.com",
        doctors: [userId],
      },
      // Agregar más pacientes si es necesario
    ];

    // crear servicios
    const service = new Services({
      name: "Servicio 1",
      description: "Consulta particular",
      currency: "ARS",
      price: 1000,
      category: "Particular",
      type: "Presencial",
      duration: 60,
      doctor: userId,
    });

    await Patients.insertMany(patients);
    await service.save();
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await Patients.deleteMany({});
    await Services.deleteMany({});
  });


  // -------------- TESTS DE GET : BUSQUEDA DE DATOS -------------- //

  describe("GET api/patients/", () => {
    it("debería crear un nuevo paciente", async () => {
      const res = await chai.request(app).get(`/api/patients/`);
      expect(res).to.have.status(201);
      expect(res.body.patients).to.be.an("array");
      expect(res.body.patients.length).to.equal(2);
    });
  });
  
  // -------------- TESTS DE POST:CREAR UN PACIENTE -------------- //

  describe("POST api/patients/new", async () => {
    it("debería devolver un mensaje de error si no se proporcionan todos los campos requeridos como obligatorios.", async () => {
      const user = await Users.findOne({});
      const userId = user._id.toString();
      const newPatient = {
        name: "Paciente 3",
        email: "paciente3@gmail.com",
      };
      const res = await chai
        .request(app)
        .post(`/api/patients/new/${userId}`)
        .send(newPatient);
      expect(res).to.have.status(422);
      expect(res.body.message).to.equal(
        "Información incompleta: Debes proporcionar como minimo el email, nombre y apellido para crear una cuenta."
      );
    });

    it("debería devolver un mensaje de error si el ID enviado no tiene el formato correcto", async () => {
      const userId = "00000c5b099d75204c5ccb00333";
      const newPatient = {
        name: "Paciente 3",
        lastName: "Apellido 3",
        email: "paciente3@gmail.com",
      };
      const res = await chai
        .request(app)
        .post(`/api/patients/new/${userId}`)
        .send(newPatient);
      expect(res).to.have.status(422);
      expect(res.body.message).to.equal(
        "Formato de ID inválido: El ID proporcionado no tiene el formato ObjectId válido."
      );
    });

    it("El usuario no existe en la base de datos", async () => {
      const userId = "00000c5b099d75204c5ccb00";
      const newPatient = {
        name: "Paciente 3",
        lastName: "Apellido 3",
        email: "paciente3@gmail.com",
      };
      const res = await chai
        .request(app)
        .post(`/api/patients/new/${userId}`)
        .send(newPatient);
      expect(res).to.have.status(404);
      expect(res.body.message).to.equal(
        "El usuario no existe en la base de datos."
      );
    });

    // Caso de paciente nuevo que no existe en base de datos
    it("debería crear un nuevo paciente", async () => {
      const user = await Users.findOne({});
      const userId = user._id.toString();
      const newPatient = {
        name: "Paciente 3",
        lastName: "Apellido 3",
        birthdate: new Date("1994-02-02"),
        govermentId: "358080589",
        email: "paciente3@gmail.com",
        gender: "Femenino",
        country: "Argentina",
        cellphone: "987654325",
      };

      const res = await chai
        .request(app)
        .post(`/api/patients/new/${userId}`)
        .send(newPatient);

      expect(res).to.have.status(201);
      expect(res.body.patient).to.be.an("object");
      expect(res.body.patient.name).to.equal("Paciente 3");
      expect(res.body.message).to.equal(
        "El paciente no se encontraba previamente en la base de datos. El paciente fue creado y asignado exitosamente al usuario!"
      );
    });

    // Caso de paciente existente en base de datos
    it("debería imputar un paciente ya existente a otro doctor", async () => {
      const newUser2 = new Users({
        email: "user2@gmail.com",
        password: "password2",
      });

      await newUser2.save();
      const user = await Users.findOne({ email: "user2@gmail.com" });
      const userId = user._id.toString();

      const newPatient = {
        name: "Paciente 1",
        lastName: "Apellido 1",
        birthdate: new Date("1990-01-01"),
        govermentId: "35808054",
        email: "paciente1@gmail.com",
      };

      const res = await chai
        .request(app)
        .post(`/api/patients/new/${userId}`)
        .send(newPatient);
      expect(res).to.have.status(201);
      expect(res.body.patient).to.be.an("object");
      expect(res.body.message).to.equal(
        "El usuario no tenia asignado al paciente pero el paciente ya se encontraba en la base de datos. Se procedio a asignar el paciente al usuario!"
      );
    });
  });

   // -------------- TESTS DE PUT: MODIFICAR UN PACIENTE -------------- //

   describe("PUT api/patients/update/:patientId", async () => {
    it("El paciente no existe en la base de datos", async () => {
      const patientId = "00000c5b099d75204c5ccb00";
      const data = { lastName: "Rodriguez" };

      const res = await chai
        .request(app)
        .put(`/api/patients/update/${patientId}`)
        .send(data);
      expect(res).to.have.status(404);
      expect(res.body.message).to.equal(
        "El paciente no existe en la base de datos."
      );
    });

    it("El paciente tiene mas de un medico asignado por lo tanto no puede actualizarse directamente.", async () => {
      // Crear un nuevo usuario
      const newUser2 = new Users({
        email: "lcastillo20245@gmail.com",
        password: "7up20245",
        name: "Lorena",
        lastName: "Castillo",
        gender: "Femenino",
        country: "Argentina",
      });
      await newUser2.save();
      const patient = await Patients.findOne();
      patient.doctors.push(newUser2._id);
      await patient.save();
      const patientId = patient._id.toString();
      const data = { lastName: "Rodriguez" };

      const res = await chai
        .request(app)
        .put(`/api/patients/update/${patientId}`)
        .send(data);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal(
        "El paciente tiene más de un médico asignado, no se puede actualizar"
      );
    });

    it("debería devolver en mensaje satisfactorio si el paciente fue actualizado satisfactoriamente.", async () => {
      const patient = await Patients.findOne();
      const patientId = patient._id.toString();
      const data = { lastName: "Rodriguez" };

      const res = await chai
        .request(app)
        .put(`/api/patients/update/${patientId}`)
        .send(data);
      expect(res).to.have.status(201);
      expect(res.body.message).to.equal(
        "El paciente fue actualizado exitosamente!"
      );
      expect(res.body.patient).to.be.an("object");
      expect(res.body.patient.lastName).to.equal("Rodriguez");
    });
  });

  // -------------- TESTS DE PUT: ASIGNAR Y DESASIGNAR UN SERVICIO A UN PACIENTE -------------- //

  describe("PUT api/patients/assign/:patientId", async () => {
    it("El paciente no existe en la base de datos", async () => {
      const patientId = "00000c5b099d75204c5ccb00";
      const service = await Services.findOne();
      const data = { serviceId: service._id };

      const res = await chai
        .request(app)
        .put(`/api/patients/assign/${patientId}`)
        .send(data);
      expect(res).to.have.status(404);
      expect(res.body.message).to.equal(
        "El paciente no existe en la base de datos."
      );
    });

    it("El servicio no existe en la base de datos", async () => {
      const patient = await Patients.findOne();
      const patientId = patient._id;
      const data = { serviceId: "00000c5b099d75204c5ccb00" };

      const res = await chai
        .request(app)
        .put(`/api/patients/assign/${patientId}`)
        .send(data);
      expect(res).to.have.status(404);
      expect(res.body.message).to.equal(
        "Servicio no encontrado en la base de datos."
      );
    });

    it("debería devolver en mensaje satisfactorio si el servicio es asignado correctamente a un paciente.", async () => {
      const patient = await Patients.findOne();
      const patientId = patient._id;
      const service = await Services.findOne();
      const data = { serviceId: service._id };

      const res = await chai
        .request(app)
        .put(`/api/patients/assign/${patientId}`)
        .send(data);
      expect(res).to.have.status(201);
      expect(res.body.message).to.equal("Servicio asignado correctamente!");
      expect(res.body.patient).to.be.an("object");
      expect(res.body.patient._id).to.equal(patientId.toString());
    });
  });

 
});
