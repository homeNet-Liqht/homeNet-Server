const familyGroup = require("../models/familyGroup");
const User = require("../models/user");

const locationController = {
  currentLocationUpdate: async (req, res) => {
    try {
      const { lat, long } = req.body;
      const updatedUser = await User.findByIdAndUpdate(
        req.idDecoded,
        {
          location: {
            type: "Point",
            coordinates: [parseFloat(long), parseFloat(lat)], // Ensure lat and long are parsed as floats
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
        .populate("members", "name location");

      if (!familyGroups || familyGroups.length === 0)
        return res.status(404).json({ code: 404, data: "Cannot find any family groups" });

      const memberLocations = [];
      familyGroups.forEach(group => {
        group.members.forEach(member => {
          memberLocations.push({
            memberId: member._id,
            memberName: member.name,
            location: member.location
          });
        });
      });

      return res.status(200).json({ code: 200, data: memberLocations });
    } catch (error) {
      return res.status(500).json({ code: 500, data: error.message });
    }
  },
  createNewZone: async (req, res) => {},
};

module.exports = locationController;
