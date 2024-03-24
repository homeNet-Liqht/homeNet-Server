const express = require("express");
const locationController = require("../controllers/location");

const zoneRoute = express.Router();

zoneRoute.post("/create", locationController.createNewZone);


module.exports = zoneRoute;