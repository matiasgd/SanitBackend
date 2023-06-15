const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);
const app = require("../server");
const { Users, Services } = require("../db_models");
const mongoose = require("mongoose");
const { describe } = require("mocha");

describe("Service Controller", () => {
  let userId; // Variable para almacenar el ID del usuario
  // Pruebas de pedidos GET
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
    0;
    userId = newUser._id.toString(); // Almacenar el ID del usuario creado

    // Crear algunos servicios relacionados con el usuario
    const newService1 = await Services.create({
      name: "Consulta general",
      duration: 60,
      type: "Presencial",
      price: 4000,
      category: "Particular",
      doctor: userId,
    });

    const newService2 = await Services.create({
      name: "Consula OSECAC",
      duration: 60,
      type: "Presencial",
      price: 1500,
      category: "Obra social",
      doctor: userId,
    });
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await Services.deleteMany({});
  });

  describe("GET /services/:_id", () => {
    it("deberia obtener todos los servicios de un medico", async () => {
      const res = await chai.request(app).get(`/api/services/${userId}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.equal(2);
    });
  });

  describe("POST /services/new", () => {
    it("deberia crear un nuevo servicio relacionado con el medico", async () => {
      const newService3 = {
        name: "Consulta OSDE",
        duration: 60,
        type: "Presencial",
        price: 1000,
        category: "Prepaga",
        doctor: userId,
      };

      const res = await chai
        .request(app)
        .post(`/api/services/new`)
        .send(newService3);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("Object");
      expect(res.body.name).to.equal(newService3.name);
    });
  });

  describe("PUT /services/update/:userId/:serviceId", () => {
    it("deberia modificar un servicio relacionado con el medico", async () => {
      const newService4 = await Services.create({
        name: "Consula OSDE",
        duration: 60,
        type: "Presencial",
        price: 3000,
        category: "Prepaga",
        doctor: userId,
      });
      const updatedNewService4 = {
        name: "Consula Swiss Medical",
        duration: 60,
        type: "Presencial",
        price: 3000,
        category: "Prepaga",
        doctor: userId,
      }

      const res = await chai
        .request(app)
        .put(`/api/services/update/${userId}/${newService4._id}`)
        .send(updatedNewService4);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("Object");
      expect(res.body.name).to.equal(updatedNewService4.name);
    });
  });

   describe("DELETE /services/delete/:userId/:serviceId", () => {
     it("deberia eliminar un servicio relacionado con el medico", async () => {
       const newService5 = await Services.create({
         name: "Consulta Medicus",
         duration: 60,
         type: "Presencial",
         price: 1500,
         category: "Prepaga",
         doctor: userId,
       });

       const res = await chai
         .request(app)
         .delete(`/api/services/delete/${userId}/${newService5._id}`)
       expect(res).to.have.status(200);
       expect(res.body).to.be.an("Object");
     });
   });
});
