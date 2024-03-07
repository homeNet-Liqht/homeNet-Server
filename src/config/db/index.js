const mongoose = require("mongoose");

const connect = async () => {
  try {
    await mongoose
      .connect(
        `mongodb+srv://homenetDB:${process.env.DB_PASSWORD}@cluster0.axbvktl.mongodb.net/homenet`
      )
      .then(() => {
        console.log("Connect to database successful");
      });
  } catch (err) {
    console.log("Connect fail");
  }
};

module.exports = connect;
