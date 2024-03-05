const firebaseApp = require("firebase/app");
const firebaseConfig = require("../config/firebase/index");
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage");

const familyGroup = require("../models/familyGroup");
const User = require("../models/user");

firebaseApp.initializeApp(firebaseConfig.firebaseConfig);
const storage = getStorage();

const familyGroupControllers = {
  create: async (req, res) => {
    try {
      const user = await User.findById(req.idDecoded);
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          data: "No file provided",
        });
      }

      const imageFile = req.file;
      const metadata = {
        contentType: imageFile.mimetype,
      };

      const sanitizedFilename = imageFile.originalname
        .replace(/[^\x00-\x7F]/g, "")
        .replace(/\s/g, "");

      const storageRefFilename = ref(storage, `family-image/${sanitizedFilename}`);
      const uploadTask = uploadBytesResumable(storageRefFilename, imageFile.buffer, metadata);

      uploadTask.on('state_changed', 
        (snapshot) => {
          // Progress monitoring
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error(error);
          return res.status(500).json({
            code: 500,
            data: "Failed to upload file",
          });
        },
        async () => {
          // Upload completed successfully, get download URL and create family group
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const newFamilyGroup = await familyGroup.create({
              familyName: req.body.familyName,
              host: user.id,
              photo: downloadURL,
            });
            return res.status(200).json({ code: 200, data: newFamilyGroup });
          } catch (error) {
            console.error(error);
            return res.status(500).json({
              code: 500,
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
};

module.exports = familyGroupControllers;
