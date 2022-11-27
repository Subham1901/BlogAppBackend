const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const morgan = require("morgan");
const fileUpload = require("../Middleware/file-upload");

const routeController = require("../Route-Controller/placeController");
const checkAuth = require("../Middleware/check-auth");
router.use(morgan("dev"));
router.get("/:uid", routeController.getPlacesUserbyUserId);
router.get("/placebyid/:pid", routeController.getPlacebyPid);
//!middleware to check and verify the JWT authentication
router.use(checkAuth);
router.post(
  "/",
  fileUpload.single("image"),
  [
    check("address").not().isEmpty(),
    check("title").not().isEmpty(),
    check("description").not().isEmpty(),
  ],
  routeController.createPlaces
);
router.delete("/:pid", routeController.deletePlacebyID);
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").not().isEmpty()],
  routeController.updatePlacebyID
);
module.exports = router;
