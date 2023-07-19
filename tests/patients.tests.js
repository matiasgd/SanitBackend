// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const { expect } = chai;
// chai.use(chaiHttp);
// const app = require("../server");
// const { Users, Patients } = require("../db_models");
// const mongoose = require("mongoose");
// const { describe } = require("mocha");

// describe("Patient Controller", () => {
//   let userId; // Variable para almacenar el ID del usuario

//   // Pruebas de pedidos GET
//   beforeEach(async () => {
//     // Crear un nuevo usuario
//     const newUser = new Users({
//       email: "jrichards@gmail.com",
//       password: "7up2024",
//       name: "James",
//       lastName: "Richards",
//       gender: "Masculino",
//       country: "Argentina",
//     });
//     await newUser.save();

//     userId = newUser._id.toString(); // Almacenar el ID del usuario creado
//     // Crear algunos pacientes relacionados con el usuario
//     const patients = [
//       {
//         name: "Paciente 1",
//         lastName: "Apellido 1",
//         birthdate: new Date("1990-01-01"),
//         govermentId: "35808054",
//         email: "paciente1@gmail.com",
//         gender: "Masculino",
//         country: "Argentina",
//         cellphone: "123456789",
//         doctors: [userId],
//       },
//       {
//         name: "Paciente 2",
//         lastName: "Apellido 2",
//         birthdate: new Date("1995-02-02"),
//         govermentId: "35808055",
//         email: "paciente2@gmail.com",
//         gender: "Femenino",
//         country: "Argentina",
//         cellphone: "987654321",
//         doctors: [userId],
//       },
//       // Agregar más pacientes si es necesario
//     ];

//     await Patients.insertMany(patients);
//   });

//   afterEach(async () => {
//     await Users.deleteMany({});
//   });
//   afterEach(async () => {
//     await Patients.deleteMany({});
//   });

//   describe("POST api/patients/new", () => {
//     it("debería crear un nuevo paciente", async () => {
//       const newPatient = {
//         name: "Paciente 3",
//         lastName: "Apellido 3",
//         birthdate: new Date("1994-02-02"),
//         govermentId: "358080589",
//         email: "paciente3@gmail.com",
//         gender: "Femenino",
//         country: "Argentina",
//         cellphone: "987654325",
//       };

//       const doctor = await Users.findOne({});
//       const doctorId = doctor._id;
//       const res = await chai
//         .request(app)
//         .post(`/api/patients/new/${doctorId}`)
//         .send(newPatient);
//       expect(res).to.have.status(200);
//       expect(res.body).to.be.an("object");
//       const createdPatient = await Patients.findOne({
//         govermentId: newPatient.govermentId,
//       });
//       expect(createdPatient).to.exist;
//       expect(createdPatient.doctors[0]._id).to.deep.equal(doctorId);
//     });
//   });

//   describe("PUT /patients/update/:patientId", () => {
//     it("debería devolver un mensaje de error si el ID enviado del paciente no existe", async () => {
//       const res = await chai
//         .request(app)
//         .put(`/api/patients/update/123123123123`);
//       expect(res).to.have.status(404);
//       expect(res.text).to.equal("Paciente no encontrado");
//     });

//     it("debería actualizar un paciente", async () => {
//       const patient = await Patients.findOne(); // Obtén un paciente existente de la base de datos
//       const res = await chai
//         .request(app)
//         .put(`/api/patients/update/${patient._id}`)
//         .send({ name: "Paciente 1 actualizado" });
//       expect(res).to.have.status(200);
//       expect(res.body).to.be.an("object");
//       expect(res.body.name).to.equal("Paciente 1 actualizado");
//     });
//   });
// });
