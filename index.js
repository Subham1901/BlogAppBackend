require("./DBConnect/connectToDB");
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const bodyparser = require("body-parser");
const placeRouter = require("./Routers/placeRoutes");
const usersRouter = require("./Routers/userRoutes");
require("dotenv").config();
const cors = require("cors");
const { log } = require("console");

//!Express Usage
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use("/uploads/image", express.static(path.join("uploads", "image")));
app.use("/blog/place", placeRouter);
app.use("/blog/user", usersRouter);
//?Router
app.use((req, res, next) => {
  res.status(404).json({ message: "Router Not Found" });
});
app.use((err, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  res.status(err.status || 404).json({
    status: err.status,
    message: err.message,
  });
});

app.listen(process.env.PORT || 3030, () => {
  console.log("Sever Started.. ");
});
