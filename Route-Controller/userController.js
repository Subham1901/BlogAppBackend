const { validationResult } = require("express-validator");
const httperrors = require("http-errors");
const User = require("../Model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let findUser;
    try {
      findUser = await User.findOne({ email: email });
      console.log(findUser);
    } catch (error) {
      return next(httperrors.NotFound("Couldn't find user, Try again"));
    }
    if (!findUser) {
      return next(httperrors.NotFound("User Not Exist, Try to signup"));
    }
    //!compare the hased password and raw passwrod
    const compare = await bcrypt.compare(password, findUser.password);
    //!if user not found or in case of password mismatch throw error
    if (!compare) {
      return next(httperrors.NotFound("Invalid Email/Password"));
    }
    let token;
    //! create JWT token
    try {
      token = jwt.sign(
        { userId: findUser.id, email: findUser.email },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
    } catch (error) {
      return next(error);
    }

    res.json({
      message: "User Logged in successfully",
      id: findUser.id,
      token: token,
      name: findUser.name,
    });
  } catch (error) {
    return next(error);
  }
};
const logoutUser = (req, res, next) => {
  res.json("logout");
};
const getAllUsers = async (req, res, next) => {
  try {
    const findAll = await User.find({}, "-password");
    console.log(findAll);
    if (!findAll || findAll.length == 0) {
      return next(httperrors.NotFound("No User found"));
    }
    res.json({
      //!To remove _(underscrorer) from the list of user
      users: findAll.map((users) => users.toObject({ getters: true })),
    });
  } catch (error) {
    next(error);
  }
};

//!create user
const createUser = async (req, res, next) => {
  console.log();
  try {
    const { email, name, password } = req.body;
    const valid = validationResult(req);
    if (!valid.isEmpty()) {
      return next(httperrors.NotAcceptable("Invalid Name/Email/Password"));
    }
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return next(
          httperrors.NotAcceptable(
            `Email "${email}" already exist, Please try to login`
          )
        );
      }
    } catch (error) {
      return next(
        httperrors.NotAcceptable("Something went wrong, Please try later")
      );
    }
    //!convert raw password to hashed value, store into DB
    let hashedPass = await bcrypt.hash(password, 10);

    let createUser;
    try {
      createUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPass,
      });
      await createUser.save();
    } catch (error) {
      return next(error);
    }
    let token;
    //! create JWT token
    try {
      token = jwt.sign(
        { userId: createUser.id, email: createUser.email },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
    } catch (error) {
      return next(error);
    }
    res.json({
      id: createUser.id,
      email: createUser.email,
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  logoutUser,
  getAllUsers,
  createUser,
};
