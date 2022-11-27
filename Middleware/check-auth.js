const httpErrors = require("http-errors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = async (req, res, next) => {
  try {
    const { token } = req.headers;

    console.log(token);
    if (!token) {
      return next(httpErrors.Unauthorized());
    }
    let decodeToekn;
    try {
      decodeToekn = jwt.verify(token, process.env.JWT_KEY);
    } catch (error) {
      return next(httpErrors.NotImplemented(error.message));
    }
    console.log(decodeToekn);
    req.userData = { id: decodeToekn.userId };
    next();
  } catch (error) {
    return next(error);
  }
};
