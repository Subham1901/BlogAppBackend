const { validationResult } = require("express-validator");
const httperrors = require("http-errors");
const getCoordsForAddress = require("../Location/findLocation");
const Place = require("../Model/dbModel");
const User = require("../Model/userModel");
const fs = require("fs");

//!get the places by each user level
const getPlacesUserbyUserId = async (req, res, next) => {
  //!Getting the user param from request
  const userId = req.params.uid;
  try {
    //!find the User by UserId and populate the places of the user (populate only be possible with ref in mongoose)
    const findbyUid = await User.findById(userId).populate("places");
    if (!findbyUid || findbyUid.length == 0) {
      next(httperrors.NotFound(`Places not found for the user ${userId}`));
      return;
    }
    res.json({ user: findbyUid });
  } catch (error) {
    next(error);
  }
};

//!Get the data by place id
const getPlacebyPid = async (req, res, next) => {
  try {
    const placeId = req.params.pid;
    let place;
    try {
      place = await Place.findById(placeId);
    } catch (error) {
      next(httperrors.NotFound("Place not found"));
    }
    res.json({ place: place });
  } catch (error) {
    next(error);
  }
};

//!Create place
const createPlaces = async (req, res, next) => {
  try {
    //! validation for the input request
    const valid = validationResult(req);
    const userId = req.userData.id;
    if (!valid.isEmpty()) {
      next(
        httperrors.NotAcceptable(
          "Please Provide All the required informations."
        )
      );
      return;
    }
    //!creating place Object for the incoming request
    const placeObj = await createPlaceObj(req);
    console.log(placeObj);
    //! creating objcet for the Model
    let createPlace = new Place(placeObj);
    let user;
    try {
      /* 
      !   before creating place find the user from incoming creator id,if not found then throw error as user not found. 
      !   after, save the place and push the place to user places and save the user as well
     */
      user = await User.findById(userId);
    } catch (error) {
      return next(httperrors.NotFound("Something went wrong! try again.."));
    }
    if (!user || user.length == 0) {
      return next(httperrors.NotFound("User not found"));
    }
    try {
      // const sess = await mongoose.startSession();
      // sess.startTransaction();
      await createPlace.save();
      await user.places.push(createPlace);
      await user.save();
      // await sess.commitTransaction();
    } catch (error) {
      return next(error);
    }
    res.json({ message: "Place Created", place: createPlace });
  } catch (error) {
    next(error);
  }
};

const deletePlacebyID = async (req, res, next) => {
  /*
   !before deleting a place first find the place by ID and populate creator(user) details
   !delete the place and pull that place from creator as well , findplace.creator.places.pull(findplace)
   ?save the creator after deleteing
   */
  let user;

  try {
    const placeId = req.params.pid;
    let findPlace;
    try {
      findPlace = await Place.findById(placeId).populate("creator");
    } catch (error) {
      return next(httperrors.NotFound("Couldn't find place"));
    }
    if (!findPlace) {
      return next(httperrors.NotFound("No Places found for the creator"));
    }
    if (findPlace.creator._id.toString() != req.userData.id) {
      return next(httperrors.Unauthorized("You are not allowed to delete!"));
    }
    const imagePath = findPlace.image;
    try {
      await findPlace.remove();
      await findPlace.creator.places.pull(findPlace);
      await findPlace.creator.save();
    } catch (error) {
      return next(httperrors.NotFound("Couldn't remove the place"));
    }
    //! delete image using file system
    fs.unlink(imagePath, (err) => {
      console.log(err);
    });
    res.json({ message: "Place Removed" });
  } catch (error) {
    next(error);
  }
};

//!Update the Place
const updatePlacebyID = async (req, res, next) => {
  try {
    console.log(req.body);
    const valid = validationResult(req);
    if (!valid.isEmpty()) {
      return next(httperrors.NotAcceptable("Invalid details"));
    }
    const placeId = req.params.pid;
    const { title, description } = req.body;
    let findPlace;
    try {
      findPlace = await Place.findById(placeId);
    } catch (error) {
      return next(httperrors.NotFound("Couldn't find place"));
    }
    if (!findPlace) {
      return next(httperrors.NotFound("Couldn't find place"));
    }

    console.log(req.userData.id, req.userData.id);

    if (findPlace.creator.toString() !== req.userData.id) {
      return next(
        httperrors.Unauthorized("You are not allowed to edit the place.")
      );
    }
    findPlace.title = title;
    findPlace.description = description;

    try {
      await findPlace.save();
    } catch (error) {
      return next(error);
    }

    res.json({
      message: "Place Updated",
      place: findPlace.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

async function createPlaceObj(req) {
  return {
    title: req.body.title,
    description: req.body.description,
    image: req.file.path,
    address: req.body.address,
    creator: req.userData.id,
  };
}

module.exports = {
  getPlacesUserbyUserId,
  getPlacebyPid,
  createPlaces,
  deletePlacebyID,
  updatePlacebyID,
};
