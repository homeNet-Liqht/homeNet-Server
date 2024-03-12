const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required field!"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
  },
  birthday: {
    type: Date,
    default: Date.now(),
  },
  phone: {
    type: String,
    default: null,
  },
  photo: {
    type: String,
  },
  fcmToken: {
    type: [String],
  },
  otp: {
    type: String,
  },
  otp_exp: {
    type: Date,
    default: Date.now() + 15 * 60 * 1000,
  },
  is_active: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  refresh_token: {
    type: String,
    default: "",
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
