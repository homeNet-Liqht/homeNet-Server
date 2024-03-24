const { uploadImage } = require("../config/firebase/storage");
const { checkIsInAGroup } = require("../helpers/inGroup");
const { generateLink, decodeLink } = require("../helpers/url");
const familyGroup = require("../models/familyGroup");
const User = require("../models/user");

const familyGroupControllers = {
  getFamilyGroup: async (req, res) => {
    try {
      const isInAGroup = await checkIsInAGroup(req.idDecoded);

      if (!isInAGroup) {
        return res
          .status(404)
          .json({ code: 404, data: "Family group not found" });
      }

      const group = await familyGroup
        .findOne({ members: req.idDecoded })
        .populate({ path: "members", select: "_id name photo" });

        res.status(200).json({ code: 200, data: group });
    } catch (error) {
      console.error("Error fetching family group:", error);
      res.status(500).json({ code: 500, data: "Server error" });
    }
  },

  create: async (req, res) => {
    try {
      const user = await User.findById(req.idDecoded);

      const isMember = await checkIsInAGroup(req.idDecoded);
      if (isMember) {
        return res.status(404).json({
          code: 404,
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

    
      let downloadURL;
      try {
        downloadURL = await uploadImage(req.file);
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError);
        return res.status(404).json({ code: 404, data: uploadError.message });
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
      const parts = req.body.groupId.split("/");
      const lastIndex = parts.length - 1;
      const decodedLink = await decodeLink(parts[lastIndex]);

      
      const group = await familyGroup.findById(decodedLink);
      if (!group)
        return res
          .status(404)
          .json({ code: 404, data: "Cannot find this room, try again later!" });
      const isUserInGroup = await checkIsInAGroup(user.id);
      if (isUserInGroup)
        return res
          .status(404)
          .json({ code: 404, data: "This user is already in a group" });

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
      const isInTheFam = await checkIsInAGroup(req.idDecoded);
      if (!isInTheFam)
        return res
          .status(404)
          .json({ code: 404, data: "This user isn't in this family" });
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
