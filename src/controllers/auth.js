const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  otpGenerated
} = require("../utils/otp");
const helpers = require("../helpers/jwt");
const Email = require("../helpers/email");


const authController = {

  signUp: async (req, res) => {

    try {
      const isExistingEmail = await User.findOne({
        email: req.body.email,
      });

      if (isExistingEmail)
        return res.status(403).json({
          code: 403,
          data: "This email is already signed up"
        });

      const password = req.body.password;


      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newOtp = otpGenerated();
      console.log(newOtp);

      const newUser = await User.create({
        email: req.body.email,
        password: hashedPassword,
        name: req.body.name,
        otp: newOtp,
        otp_exp: Date.now() + (15 * 60 * 1000)
      });
      await new Email(newUser).sendOTPNewUser(newOtp, newUser);

      return res.status(201).json({
        code: 201,
        data: newUser.email
      });
    } catch (err) {
      return res.status(500).json({
        code: 500,
        data: err.message
      });
    }
  },

  validAccount: async (req, res) => {
    try {
      const userId = req.user.userId;
      const otpType = req.user.type
      if (otpType == "Signup") {
        const active_user = await User.findOneAndUpdate({
          _id: userId
        }, {
          $set: {
            is_active: true,
            otp: "",
            otp_exp: ""
          }
        }, );
        if (!active_user) return res.status(404).json({
          code: 404,
          data: "Cannot find this user!"
        })

        if (active_user) return res.status(201).json({
          code: 201,
          data: "Your account is now ready to use"
        });
      }
      if (otpType == "ForgotPassword") {
        const forgot_user = await User.findById({
          _id: userId
        })
        if (!forgot_user) return res.status(404).json({
          code: 404,
          data: "Cannot find this user!"
        })
        if (forgot_user) return res.status(301).json({
          code: 301,
          data: "You can change your password now!"
        })
      }

    } catch (err) {
      res.status(500).json({
        code: 500,
        data: err.message
      })
    }

  },

  signIn: async (req, res) => {
    try {
      const user = await User.findOne({
        email: req.body.email
      });
      if (!user) return res.status(404).json("Cannot find this email!");

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!validPassword) return res.status(400).json("Wrong password!");

      if (!user.is_active) return res.status(403).json("This account isn't verify yet, please verify it before access to our application")

      if (user && validPassword) {
        const accessToken = helpers.generateAccessToken(user);
        const refreshToken = helpers.generateRefreshToken(user);
        console.log(accessToken);
        const updatedUser = await User.updateOne({
          id: user._id
        }, {
          $set: {
            refresh_token: refreshToken
          }
        });
        await res.cookie("refreshtoken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
        });
        await res.cookie("accesstoken", accessToken, {
          secure: false,
          path: "/",
        });
        const {
          password,
          refresh_token,
          otp,
          otp_exp,
          resetPasswordExpires,
          resetPasswordToken,
          created_at,
          updated_at,
          ...others
        } = user._doc;
        return res.status(200).json({
          code: 200,
          ...others,
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: error.message
      });
    }
  },

  logOut: (req, res) => {
    try {
      res.clearCookie('accesstoken');
      res.clearCookie('refreshtoken');
      res.status(200).json({

        code: 200,
        data: 'Logout successful'

      });
    } catch (error) {
      return res.status(500).json({
        code: 500,
        data: error.message
      });
    }
  },

  requestRefreshToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshtoken;
      console.log(refreshToken);
      if (!refreshToken) return res.status(402).json("You are not authenticated")

      jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, user) => {
        if (err) console.log(err);
        const userDb = await User.findById(user.id);
        if (!userDb) {
          return res.status(401).json("User not found");
        }
        const newAccessToken = helpers.generateAccessToken(userDb)
        const newRefreshToken = helpers.generateRefreshToken(userDb);

        const updateRefreshToken = await User.findOneAndUpdate({
          _id: user.userId
        }, {
          $set: {
            refresh_token: newRefreshToken
          }
        }, {
          new: true
        });
        res.cookie("refreshtoken", newRefreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict"
        });
        res.cookie('accesstoken', newAccessToken, {
          secure: false,
          path: "/",
          sameSite: "strict"
        })

        res.status(200).json({
          code: 200,
          data: "Sign in successfully"
        });
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: error.message
      })
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const user = await User.findOne({
        email: req.body.email
      });
      if (!user) return res.status(404).json("Cannot find this email!");

      const resetOtp = otpGenerated();

      const updatedUser = await User.findOneAndUpdate({
        email: req.body.email
      }, {
        $set: {
          resetPasswordToken: resetOtp,
          resetPasswordExpires: Date.now() + (15 * 60 * 1000)
        }
      })


      if (!updatedUser) return res.status(400).json("Something went wrong, try again later!")

      await new Email(updatedUser).sendOTPResetPassword(resetOtp, updatedUser);

      return res.status(200).json({
        code: 200,
        data: "The reset OTP has been sent to user"
      })
    } catch (error) {
      return res.status(500).send({
        code: 500,
        data: err.message
      })
    }
  },

  resendOtpNewUser: async (req, res) => {
    try {


      const user = await User.findOne({
        email: req.body.email
      });
      if (!user) return res.status(404).json({
        code: 404,
        error: "Cannot find this email"
      });

      if (user.is_active) return res.status(403).json({
        code: 403,
        error: "This user is already active"
      });
      console.log(user);
      console.log(user.is_active);
      newOtp = otpGenerated();

      const updatedUser = await User.findOneAndUpdate({
        email: req.body.email
      }, {
        $set: {
          otp: newOtp,
          otp_exp: Date.now() + (15 * 60 * 1000)
        }
      });

      await new Email(updatedUser).reSendOtpNewUser(newOtp, updatedUser)


      res.status(200).json({
        code: 200,
        data: "The reset OTP has been sent to user"
      });
    } catch (error) {
      if (error.code === 11000) {

        return res.status(400).json({
          code: 400,
          error: "Duplicate email address"
        });
      }
      res.status(500).json({

        code: 500,
        data: error.message

      });
    }
  }
};

module.exports = {
  authController
};