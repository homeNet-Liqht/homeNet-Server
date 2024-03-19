const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fieldNameSize: 150, 
    fieldSize: 1024 * 1024 * 10 * 2, 
  },
});

module.exports = upload;
