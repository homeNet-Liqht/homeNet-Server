const express = require("express");
const locationController = require("../controllers/location");
const locationRoute = express.Router();

locationRoute.get("/current-location", locationController.currentLocation);

module.exports = locationRoute;
