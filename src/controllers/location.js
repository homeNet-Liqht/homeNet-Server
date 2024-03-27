const familyGroup = require("../models/familyGroup");
const User = require("../models/user");
const Zone = require("../models/zone");

const locationController = {
  currentLocationUpdate: async (req, res) => {
    try {
      const { lat, long } = req.body;
      const updatedUser = await User.findByIdAndUpdate(
        req.idDecoded,
        {
          location: {
            type: "Point",
            coordinates: [parseFloat(long), parseFloat(lat)],
          },
        },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(400).json({ code: 400, data: "Update fail!" });
      }
      return res.status(200).json({ code: 200, data: updatedUser.location });
    } catch (error) {
      console.error("Error updating user location:", error);
      return res.status(500).json({ code: 500, data: error.message });
    }
  },
  getCurrentUserLocation: async (req, res) => {
    try {
      const user = await User.findById(req.idDecoded);
      if (!user)
        return res
          .status(404)
          .json({ code: 404, data: "Couldn't find this user's location" });
      return res.status(200).json({ code: 200, data: user.location });
    } catch (error) {
      console.error("Error updating user location:", error);
      return res.status(500).json({ code: 500, data: error.message });
    }
  },
  getMemberLocation: async (req, res) => {
    try {
      const familyGroups = await familyGroup
        .find({ members: { $in: [req.idDecoded] } })
        .populate("members", "_id name location photo");

      if (!familyGroups || familyGroups.length === 0)
        return res
          .status(404)
          .json({ code: 404, data: "Cannot find any family groups" });

      const memberLocations = [];
      familyGroups.forEach((group) => {
        group.members.forEach((member) => {
          memberLocations.push({
            memberId: member._id,
            memberName: member.name,
            location: member.location,
          });
        });
      });

      return res.status(200).json({ code: 200, data: memberLocations });
    } catch (error) {
      return res.status(500).json({ code: 500, data: error.message });
    }
  },



  createNewZone: async (req, res) => {
    try {
      const getFamily = await familyGroup.findOne({
        members: { $in: [req.idDecoded] },
      });

      if (!getFamily)
        return res
          .status(404)
          .json({ code: 404, data: "Please create a family group" });
      if (
        !req.body.lat ||
        !req.body.long ||
        !req.body.radius ||
        !req.body.safeTime
      ) {
        return res
          .status(400)
          .json({ code: 400, data: "Missing required fields" });
      }
      const newZone = await Zone.create({
        creator: req.idDecoded,
        lat: req.body.lat,
        long: req.body.long,
        radius: req.body.radius,
        safeTime: req.body.safeTime,
      });

      if (!newZone)
        return res
          .status(400)
          .json({ code: 400, data: "Error create new zone!" });
      if (!getFamily.zones) getFamily.zones = [];

      getFamily.zones.push(newZone._id);
      await getFamily.save();

      return res.status(200).json({ code: 200, data: newZone });
    } catch (error) {
      return res.status(500).json({ code: 500, data: error.message });
    }
  },
  editZone: async (req, res) => {
    try {
      const getZone = await Zone.findById(req.params.zid);
      if (!getZone) {
        return res.status(404).json({ code: 404, data: "Zone not found" });
      }
      if (getZone.creator != req.idDecoded) {
        return res
          .status(400)
          .json({ code: 400, data: "This is not the creator of the zone!" });
      }

      const updatedZone = await Zone.findByIdAndUpdate(
        req.params.zid,
        {
          lat: req.body.lat,
          long: req.body.long,
          radius: req.body.radius,
          safeTime: req.body.safeTime,
        },
        { new: true }
      );

      if (!updatedZone) {
        return res.status(400).json({ code: 400, data: "Error updating zone" });
      }

      return res.status(200).json({ code: 200, data: updatedZone });
    } catch (error) {
      return res.status(500).json({ code: 500, data: error.message });
    }
  },
  deleteZone: async (req, res) => {
    try {
      const getZone = await Zone.findById(req.params.zid);
      if (!getZone) {
        return res.status(404).json({ code: 404, data: "Zone not found" });
      }
      if (getZone.creator != req.idDecoded) {
        return res
          .status(400)
          .json({ code: 400, data: "This is not the creator of the zone!" });
      }
      await Zone.findByIdAndDelete(req.params.zid);

      return res
        .status(200)
        .json({ code: 200, data: "Zone deleted successfully" });
    } catch (error) {
      return res.status(500).json({ code: 500, data: error.message });
    }
  },
  getZones: async (req, res) => {
    try {
      const familyMember = await familyGroup
        .find({
          members: { $in: [req.idDecoded] },
        })
        .populate("zones");
      if (!familyMember)
        return res
          .status(404)
          .json({ code: 404, data: "This member isn't in a family" });
      return res.status(200).json({ code: 200, data: familyMember });
    } catch (error) {
      return res.status(500).json({ code: 500, data: error.message });
    }
  },
};

module.exports = locationController;
