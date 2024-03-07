const { uploadImage } = require("../config/firebase/storage");
const { generateLink, decodeLink } = require("../helpers/url");
const familyGroup = require("../models/familyGroup");
const User = require("../models/user");

const familyGroupControllers = {
  getFamilyGroup: async (req, res) => {
    try {
      const group = await familyGroup.findOne({
        members: { $in: [req.idDecoded] },
      });

      if (!group) {
        return res
          .status(404)
          .json({ code: 404, data: "Family group not found" });
      }

      res.status(200).json({ code: 200, data: group });
    } catch (error) {
      console.error("Error fetching family group:", error);
      res.status(500).json({ code: 500, data: "Server error" });
    }
  },

  create: async (req, res) => {
    try {
      const user = await User.findById(req.idDecoded);

      const isMember = await familyGroup.findOne({
        members: { $in: [req.idDecoded] },
      });
      if (isMember) {
        return res.status(403).json({
          code: 403,
          data: "This user is already a member in a group",
        });
      }

      const isHosting = await familyGroup.findOne({ host: req.idDecoded });
      if (isHosting) {
        return res
          .status(418)
          .json({ code: 418, data: "This user is already a host" });
      }

      if (!req.file) {
        return res.status(400).json({ code: 400, data: "No file provided" });
      }

      const imageFile = req.file;
      let downloadURL;
      try {
        downloadURL = await uploadImage(imageFile);
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError);
        return res.status(403).json({ code: 403, data: uploadError.message });
      }

      const newFamilyGroup = await familyGroup.create({
        familyName: req.body.familyName,
        host: user.id,
        photo: downloadURL,
        members: [user.id],
      });

      return res.status(200).json({ code: 200, data: newFamilyGroup });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ code: 500, data: "Internal server error" });
    }
  },

  join: async (req, res) => {
    try {
      const user = await User.findById(req.idDecoded);
      const decodedLink = await decodeLink(req.params.gid);
      const group = await familyGroup.findById(decodedLink);
      if (!group)
        return res
          .status(404)
          .json({ code: 404, data: "Cannot find this room, try again later!" });
      const isUserInGroup = await familyGroup.findOne({
        members: { $in: [user.id] },
      });
      if (isUserInGroup)
        return res
          .status(403)
          .json({ code: 403, data: "This user is already in a group" });

      await group.members.push(user.id);

      await group.save();

      return res.status(200).json({
        code: 200,
        data: `${user.name} is being a part of ${group.familyName}`,
      });
    } catch (error) {
      res.status(500).json({ code: 500, data: "Server error" });
    }
  },

  hostEdit: async (req, res) => {
    try {
      const newHost = await User.findById(req.body.newHost);
      const isInTheFam = await familyGroup.findOne({
        members: { $in: [newHost.id] },
      });
      if (!isInTheFam)
        return res
          .status(401)
          .json({ code: 401, data: "This user isn't in this family" });
      if (!newHost)
        return res
          .status(404)
          .json({ code: 404, data: "Cannot find this user, try again later!" });
      await familyGroup.findOneAndUpdate(
        { id: req.userData.id },
        { $set: { host: newHost.id } }
      );

      res
        .status(200)
        .json({ code: 200, data: `${newHost.name} has became the new host` });
    } catch (error) {
      res.status(500).json({ code: 500, data: "Server error" });
    }
  },

  leave: async (req, res) => {},

  generateJoinLink: async (req, res) => {
    try {
      const user = await User.findById(req.idDecoded);
      if (!user)
        return res
          .status(404)
          .json({ code: 404, data: "Cannot find this user!" });
      const isHosting = await familyGroup.findOne({ host: req.idDecoded });

      if (!isHosting)
        return res.status(400).json({
          code: 400,
          data: "You didn't host any group, please create one!",
        });

      const baseUrl = process.env.BASE_URL
        ? process.env.BASE_URL
        : "http://localhost:8000";
      const responseLink = generateLink(baseUrl, isHosting.id);
      res.status(201).json({ code: 200, data: responseLink });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ code: 500, data: "Server error" });
    }
  },
};

module.exports = familyGroupControllers;
