const firebaseApp = require("firebase/app");
const firebaseConfig = require("../config/firebase/index");
const {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} = require("firebase/storage");
const { generateLink, decodeLink } = require("../utils/url");
const familyGroup = require("../models/familyGroup");
const User = require("../models/user");

firebaseApp.initializeApp(firebaseConfig.firebaseConfig);
const storage = getStorage();

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
      const isHosting = await familyGroup.findOne({ host: req.idDecoded });

      if (isHosting)
        return res
          .status(418)
          .json({ code: 418, data: "This user is already a host" });
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          data: "No file provided",
        });
      }

      const imageFile = req.file;
      const acceptedEndPoints = ["image/png", "image/jpg", "image/jpeg"];
      const metadata = {
        contentType: imageFile.mimetype,
      };
      if (!acceptedEndPoints.includes(metadata.contentType))
        return res.status(415).json({
          code: 415,
          data: `${metadata.contentType} file is not supported, please try another one`,
        });

      const sanitizedFilename = imageFile.originalname
        .replace(/[^\x00-\x7F]/g, "")
        .replace(/\s/g, "");

      const storageRefFilename = ref(
        storage,
        `family-image/${sanitizedFilename}`
      );
      const uploadTask = uploadBytesResumable(
        storageRefFilename,
        imageFile.buffer,
        metadata
      );

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error(error);
          return res.status(500).json({
            code: 500,
            data: "Failed to upload file",
          });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const newFamilyGroup = await familyGroup.create({
              familyName: req.body.familyName,
              host: user.id,
              photo: downloadURL,
            });

            await newFamilyGroup.member.push(user.id);
            await newFamilyGroup.save();
            return res.status(200).json({ code: 200, data: newFamilyGroup });
          } catch (error) {
            console.error(error);
            return res.status(400).json({
              code: 400,
              data: "Failed to create family group",
            });
          }
        }
      );
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        code: 500,
        data: "Internal server error",
      });
    }
  },

  join: async (req, res) => {
    try {
      const user = await User.findById(req.idDecoded);
      console.log(user);
      const decodedLink = await decodeLink(req.params.gid);
      console.log(decodedLink);
      const group = await familyGroup.findById(decodedLink);

      if (!group)
        return res
          .status(404)
          .json({ code: 404, data: "Cannot find this room, try again later!" });

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
