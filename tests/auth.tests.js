const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);
const app = require("../server");
const { Users } = require("../db_models");
const { describe } = require("mocha");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

describe("Auth Controller", () => {
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

  // Pruebas de pedidos POST
  describe("POST /api/auth/login", () => {
    it("debería devolver un mensaje de error si el email no existe en la base de datos", async () => {
      const LoginInformation = {
        email: "jrichards24@gmail.com",
        password: "7up2024",
      };
      const res = await chai
        .request(app)
        .post(`/api/auth/login`)
        .send(LoginInformation);
      expect(res).to.have.status(401);
      expect(res.text).to.equal("User not found in the database");
    });
    it("debería devolver un mensaje de error si el password del usuario es incorrecto", async () => {
      const res = await chai
        .request(app)
        .post(`/api/auth/login`)
        .send({ email: "jrichards@gmail.com", password: "7up1000" });
      expect(res).to.have.status(401);
      expect(res.text).to.equal("Wrong password");
    });
  });
  it("debería devolver un token si el usuario se loguea correctamente", async () => {
    const res = await chai
      .request(app)
      .post(`/api/auth/login`)
      .send({ email: "jrichards@gmail.com", password: "7up2024" });
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("object");
  });

  describe("POST /api/auth/logout", () => {
    it("", async () => {
      const res = await chai.request(app).post(`/api/auth/logout`);
      expect(res).to.have.status(200);
      expect(res.text).to.equal("User logged out");
      expect(res).to.not.have.cookie("token");
    });
  });
});
