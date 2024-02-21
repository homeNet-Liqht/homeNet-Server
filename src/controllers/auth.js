const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const email = require("../helpers/email");
const otpGenerated = require("../utils/otp");
const helpers = require("../helpers/jwt");
const authController = {
  signUp: async (req, res) => {
    console.log(req.body);
    try {
      const isExistingEmail = await User.findOne({
        email: req.body.email,
      });

      if (isExistingEmail)
        return res.status(403).json("This email is already signed up");

      const password = req.body.password;
      const confirmPassword = req.body.confirmPassword;
      if (password != confirmPassword)
        return res.status(400).json("Passwords do not match");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newOtp = otpGenerated();

      const newUser = await User.create({
        email: req.body.email,
        password: hashedPassword,
        name: req.body.name,
        phone: req.body.phone,
        birthday: req.body.birthday,
        otp: newOtp,
      });

      await new email(newUser).sendOTP(newOtp);

      return res.status(201).json("User registered successfully");
    } catch (err) {
      return res.status(500).json(err);
    }
  },

  otpConfirmation: async (req, res) => {
    try {
      const userId = req.params.uid;
      const clientOtp = req.body.otp;

      const user = await User.findOne({ id: userId });

      if (!user) {
        return res.status(404).json("User not found");
      }

      if (user.otp_exp < Date.now()) {
        return res.status(403).json("Your token is expired");
      }

      if (user.otp != clientOtp) {
        return res.status(403).json("This OTP is not valid");
      }

      const active_user = await User.updateOne(
        { id: userId },
        { $set: { is_active: true, otp: "", otp_exp: "" } }
      );
      if (active_user) res.status(201).json("Your account is now active");
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  signIn: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(400).json("Cannot find this email!");

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!validPassword) return res.status(400).json("Wrong password!");

      if (user && validPassword) {
        const accessToken = helpers.generateAccessToken(user);
        const refreshToken = helpers.generateRefreshToken(user);
        console.log(accessToken);
        const updatedUser = await User.updateOne(
          { id: user._id }, 
          { $set: { refresh_token: refreshToken }}
        );
        await res.cookie("refreshtoken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
        });
        await res.cookie("accesstoken", accessToken, {
          secure: false,
          path: "/",
        });
        const { password, refresh_token, ...others } = user._doc;
        return res.status(200).json({
          ...others,
        });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

module.exports = { authController };
