const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);
const app = require("../server");
const { Users } = require("../db_models");

describe("User Controller", () => {
  // Pruebas de pedidos GET
  describe("GET /users", () => {
    it("debería obtener todos los usuarios", async () => {
      const res = await chai.request(app).get("/api/users");  
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
    });
  });

  describe("GET /users/:_id", () => {
    beforeEach(async () => {
       const newUser = new Users({
         email: "jrichards@gmail.com",
         password: "7up2024",
         name: "James",
         lastName: "Richards",
         gender: "Masculino",
         country: "Argentina",
       });
      await newUser.save();
    });

    afterEach(async () => {
      await Users.deleteMany({});
    });

    it("debería obtener un usuario por su ID", async () => {
      const user = await Users.findOne();
      const res = await chai.request(app).get(`/api/users/${user._id}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body._id).to.equal(user._id.toString());
    });

    it("debería devolver un mensaje de error si el ID enviado no tiene el formato correcto", async () => {
      const res = await chai.request(app).get("/api/users/123456789");
      expect(res).to.have.status(404);
      expect(res.text).to.equal("Invalid user ID");
    });

    it("debería devolver un mensaje de error si el ID no se encuentra en la base de datos", async () => {
      const nonExistingId = "00000c5b099d75204c5ccb00"; // ID Editado para que no exista en la DB
      const res = await chai.request(app).get(`/api/users/${nonExistingId}`);
      expect(res).to.have.status(404);
      expect(res.text).to.equal("User not found");
    });
  });

  describe("POST /api/users/new", () => {
    afterEach(async () => {
      await Users.deleteMany({});
    });

    it("debería crear un nuevo usuario", async () => {
      const newUser = {
        email: "UserForTesting@gmail.com",
        password: "7up2024",
        name: "UserForTesting",
        lastName: "UserForTesting",
        gender: "Masculino",
        country: "Argentina",
      };

      const res = await chai.request(app).post("/api/users/new").send(newUser);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body.name).to.equal(newUser.name);
    });
  });

  describe("PUT /users/update/:_id", () => {
    beforeEach(async () => {
      const newUser = new Users({
        email: "UserForTesting@gmail.com",
        password: "7up2024",
        name: "UserForTesting",
        lastName: "UserForTesting",
        gender: "Masculino",
        country: "Argentina",
      });
      await newUser.save();
    });

    afterEach(async () => {
      await Users.deleteMany({});
    });

    it("debería actualizar un usuario existente", async () => {
      const user = await Users.findOne();
      const updatedUserData = {
        email: "updateduser@gmail.com",
      };

      const res = await chai
        .request(app)
        .put(`/api/users/update/${user._id}`)
        .send(updatedUserData);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body.email).to.equal(updatedUserData.email);
    });

    it("debería devolver un mensaje de error si el ID enviado no tiene el formato correcto", async () => {
      const res = await chai.request(app).put("/api/users/update/123456789");
      expect(res).to.have.status(404);
      expect(res.text).to.equal("Invalid user ID");
    });

    it("debería devolver un mensaje de error si el ID no se encuentra en la base de datos", async () => {
      const nonExistingId = "00000c5b099d75204c5ccb00"; // ID Editado para que no exista en la DB
      const res = await chai
        .request(app)
        .put(`/api/users/update/${nonExistingId}`);
      expect(res).to.have.status(404);
      expect(res.text).to.equal("User not found");
    });
  });

  describe("DELETE /users/:_id", () => {
    it("debería devolver un mensaje de error si el ID enviado del paciente no existe", async () => {
      const res = await chai
        .request(app)
        .delete(`/api/users/delete/123123123123`)
      expect(res).to.have.status(404);
      expect(res.text).to.equal("Doctor no encontrado");
    });

    it("debería eliminar un médico", async () => {
      const user = new Users({
          email: "UserForTesting@gmail.com",
          password: "7up2024",
          name: "UserForTesting",
          lastName: "UserForTesting",
          gender: "Masculino",
          country: "Argentina",
        });
      const doctor = await user.save();
      const res = await chai
        .request(app)
        .delete(`/api/users/delete/${doctor._id}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body._id).to.equal(doctor._id.toString());
    });
  });
});
