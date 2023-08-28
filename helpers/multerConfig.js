const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Especifica la carpeta donde se guardarán los archivos
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Genera un nombre único para el archivo
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Otras opciones de configuración si las necesitas
const multerConfig = {
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2, // Límite de tamaño de archivo (en este ejemplo, 2MB)
  },
  fileFilter: (req, file, cb) => {
    // Solo se permiten archivos XLSX y CSV
    console.log(file.mimetype,"MIME TYPE")
    console.log(path.extname(file.originalname).toLowerCase(),"path.extname(file.originalname).toLowerCase()");    
    console.log(file.originalname, "Informacion del archivo");

    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    const allowedExtensions = [".xlsx", ".csv"];

    console.log(allowedMimes.includes(file.mimetype));
    if (
      allowedMimes.includes(file.mimetype) &&
      allowedExtensions.includes(path.extname(file.originalname).toLowerCase())
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Formato de archivo no válido. Solo se permiten archivos XLSX y CSV."
        )
      );
    }
  },
};

module.exports = multerConfig;
