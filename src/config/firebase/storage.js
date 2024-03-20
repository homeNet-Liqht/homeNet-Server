const firebaseApp = require("firebase/app");
const firebaseConfig = require("./index");
const {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} = require("firebase/storage");

firebaseApp.initializeApp(firebaseConfig.firebaseConfig);
const storage = getStorage();

const uploadImage = async (imageFile) => {
  const acceptedEndPoints = [
    "image/heif",
    "image/png",
    "image/jpg",
    "image/jpeg",
  ];
  const metadata = {
    contentType: imageFile.mimetype,
  };
  if (!acceptedEndPoints.includes(metadata.contentType)) {
    return Promise.reject(
      new Error(
        `${metadata.contentType} file is not supported, please try another one`
      )
    );
  }

  const sanitizedFilename = imageFile[0].originalname
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\s/g, "");
  const storageRefFilename = ref(storage, `family-image/${sanitizedFilename}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(
      storageRefFilename,
      imageFile[0].buffer,
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
        console.error("Error uploading file:", error);
        reject(new Error("Failed to upload file"));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (err) {
          console.error("Error getting download URL:", err);
          reject(new Error(err.message));
        }
      }
    );
  });
};
const uploadImages = async (imagesFiles) => {
  console.log(imagesFiles);
  try {
    const downloadURLs = await Promise.all(
      imagesFiles.image.map(async (file) => {
        const acceptedEndPoints = [
          "image/heif",
          "image/png",
          "image/jpg",
          "image/jpeg",
        ];
        const metadata = {
          contentType: file.mimetype,
        };

        if (!acceptedEndPoints.includes(metadata.contentType)) {
          throw new Error(
            `${metadata.contentType} file is not supported, please try another one`
          );
        }

        const sanitizedFilename = file.originalname
          .replace(/[^\x00-\x7F]/g, "")
          .replace(/\s/g, "");
        const storageRefFilename = ref(
          storage,
          `task-image/${sanitizedFilename}`
        );

        return new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(
            storageRefFilename,
            file.buffer,
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
              console.error("Error uploading file:", error);
              reject(new Error("Failed to upload file"));
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(
                  uploadTask.snapshot.ref
                );
                resolve(downloadURL);
              } catch (err) {
                console.error("Error getting download URL:", err);
                reject(new Error(err.message));
              }
            }
          );
        });
      })
    );

    return downloadURLs;
  } catch (error) {
    throw error;
  }
};

module.exports = { uploadImage, uploadImages };
