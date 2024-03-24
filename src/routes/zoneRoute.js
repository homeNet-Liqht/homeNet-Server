const express = require("express");
const locationController = require("../controllers/location");

const zoneRoute = express.Router();
zoneRoute.get("/", locationController.getZones);
zoneRoute.post("/create", locationController.createNewZone);
zoneRoute.put("/edit/:zid", locationController.createNewZone);
zoneRoute.delete("/del/:zid", locationController.createNewZone);

module.exports = zoneRoute;
