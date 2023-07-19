const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);
const app = require("../server");
const { Users } = require("../db_models");
const sinon = require("sinon");
const transporter = require("../config/transporter");
const { corsOrigin, sanitEmail } = require("../config");
const { generateResetToken } = require("../utils/token");

describe("Auth Controller", () => {
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

    const user3 = new Users({
      email: "jlema1990@gmail.com",
      password: "password2",
    });
    await user3.save();
  });
  afterEach(async () => {
    // Elimina los usuarios creados en la base de datos después de las pruebas
    await Users.deleteMany({});
  });

  // Pruebas de pedidos POST
  describe("POST /api/auth/login", () => {
    it("debería devolver un mensaje de error si faltan email o contraseña", async () => {
      const LoginInformation = {
        email: "jrichards24@gmail.com",
      };
      const res = await chai
        .request(app)
        .post(`/api/auth/login`)
        .send(LoginInformation);
      expect(res).to.have.status(401);
      expect(res.text).to.equal("Faltan campos obligatorios");
    });

    it("debería devolver un mensaje de error si se supera el límite de intentos", async () => {
      const user = await Users.findOne({ email: "user1@example.com" });
      user.attempts_count = 3;
      await user.save();
      const res = await chai.request(app).post(`/api/auth/login`).send({
        email: "user1@example.com",
        password: "password2",
      });
      expect(res).to.have.status(401);
      expect(res.text).to.equal(
        "Se ha superado el límite de intentos de inicio de sesión"
      );
    });

    it("debería devolver un mensaje de error si la contraseña es incorrecta", async () => {
      const user = await Users.findOne({ email: "user1@example.com" });
      user.attempts_count = 0;
      const res = await chai.request(app).post(`/api/auth/login`).send({
        email: "user1@example.com",
        password: "password2",
      });
      expect(res).to.have.status(401);
      expect(res.text).to.equal("Credenciales incorrectas");
    });

    it("debería devolver un mensaje de error si la contraseña es incorrecta", async () => {
      const user = await Users.findOne({ email: "user1@example.com" });
      user.attempts_count = 0;
      const res = await chai.request(app).post(`/api/auth/login`).send({
        email: "user1@example.com",
        password: "password1",
      });
      expect(res).to.have.status(201);
      expect(res.body).to.be.an("object");
      expect(res.body.email).to.equal("user1@example.com");
    });
  });

  describe("POST /api/auth/recover", () => {
    it("debería devolver un mensaje de error si el email no se encuentra registrado", async () => {
      const mail = { email: "jrichards24@gmail.com" };
      const res = await chai.request(app).post(`/api/auth/recover`).send(mail);
      expect(res).to.have.status(400);
      expect(res.body.error).to.be.true;
      expect(res.body.message).to.equal("El email no se encuentra registrado");
    });

    it("debería devolver un mensaje satisfactorio y enviar el email de recuperacion de password al usuario.", async () => {
      const mail = { email: "jlema1990@gmail.com" };

      // Crea un stub para la función findOne de Users para simular que el usuario existe
      const user = await Users.findOne({ email: mail.email });
      const userId = user._id;
      const findOneStub = sinon
        .stub(Users, "findOne")
        .resolves({ _id: userId });

      // Crea un stub para la función sendMail del transporter para simular el envío de correo electrónico
      const sendMailStub = sinon.stub(transporter, "sendMail").resolves();

      const res = await chai.request(app).post(`/api/auth/recover`).send(mail);
      expect(res).to.have.status(201);
      expect(res.body.message).to.equal(
        "Se ha enviado un correo electrónico para restablecer la contraseña"
      );

      // Verifica que la función findOne se haya llamado con el email correcto
      sinon.assert.calledOnceWithExactly(findOneStub, { email: mail.email });

      // Verifica que la función sendMail se haya llamado con los argumentos correctos
      sinon.assert.calledOnceWithExactly(sendMailStub, {
        from: sanitEmail,
        to: mail.email,
        subject: "Recuperación de contraseña",
        text: sinon.match(/restablecer tu contraseña/),
      });
    });
  });

  // describe("POST /api/auth/reset-password", () => {
  //   it("debería devolver un mensaje satisfactorio y enviar el email de recuperacion de password al usuario.", async () => {
  //     const mail = { email: "jlema1990@gmail.com" };
  //     const user = await Users.findOne({ email: mail.email });

  //     console.log(user, "user in test"); // Add this line for logging

  //     const token = generateResetToken(user._id);
  //     const newPassword = "password1";

  //     const res = await chai
  //       .request(app)
  //       .post(`/api/auth/reset-password`)
  //       .send({ token, newPassword });

  //     expect(res).to.have.status(201);
  //     expect(res.text).to.equal("Contraseña actualizada exitosamente");
  //   });
  // });
});
