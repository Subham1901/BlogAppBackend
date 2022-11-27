const multer = require("multer");
const uuid = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "uploads/image");
    },
    filename: (req, file, callback) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      console.log(ext);
      callback(null, Date.now() + "." + ext);
    },
  }),
  fileFilter: (req, file, callback) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Only JPG/PNG/JPEG are allowed");
    callback(error, isValid);
  },
});

module.exports = fileUpload;
