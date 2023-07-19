const express = require("express");
const router = express.Router();
const {
  userMe,
  userLogin,
  sendPasswordResetEmail,
  recoverPassword,
  resetPassword,
  updatePassword,
  userLogout,
} = require("../controllers/auth_controller");

//-----------RUTAS GENERALES-------------//

// OBTENER EL USUARIO AUTENTICADO
router.get("/me", userMe);

// AUTENTICAR UN USUARIO
router.post("/login", userLogin);

// RECOVER PASSWORD
router.post("/recover", recoverPassword);

// // RESET PASSWORD
// router.post("/send-reset-email/:userId", sendPasswordResetEmail);

router.post("/reset-password", resetPassword);

// CAMBIAR CONTRASEÑA
router.put("/newpassword/:userId", updatePassword);

// DESAUTENTICAR UN USUARIO
router.post("/logout", userLogout);


module.exports = router;