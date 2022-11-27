const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const morgan = require("morgan");
const fileUpload = require("../Middleware/file-upload");

const userController = require("../Route-Controller/userController");

router.use(morgan("dev"));
router.get("/", userController.getAllUsers);

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 5 })],
  userController.loginUser
);
router.post("/logout", userController.logoutUser);
router.post(
  "/signup",
  fileUpload.single("image"),
  [
    body("name").not().isEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  userController.createUser
);

module.exports = router;
