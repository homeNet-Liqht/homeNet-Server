const express = require("express");
const locationController = require("../controllers/location");
const locationRoute = express.Router();

locationRoute.post("/update-location", locationController.currentLocationUpdate);
locationRoute.get("/current-location", locationController.getCurrentUserLocation);
locationRoute.post("/members-location", locationController.getMemberLocation);

module.exports = locationRoute;
