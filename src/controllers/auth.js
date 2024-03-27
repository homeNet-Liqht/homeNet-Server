const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { otpGenerated } = require("../utils/otp");
const helpers = require("../helpers/jwt");
const Email = require("../helpers/email");


const authController = {
  signUp: async (req, res) => {
    try {
      const isExistingEmail = await User.findOne({
        email: req.body.email,
      });

      if (isExistingEmail)
        return res.status(400).json({
          code: 400,
          data: "This email is already signed up",
        });

      const password = req.body.password;

      if (!password)
        return res
          .status(400)
          .json({ code: 400, data: "Password is a required field" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newOtp = otpGenerated();
      console.log(newOtp);

      const newUser = await User.create({
        email: req.body.email,
        password: hashedPassword,
        name: req.body.name,
        otp: newOtp,
        otp_exp: Date.now() + 15 * 60 * 1000,
      });
      await new Email(newUser).sendOTPNewUser(newOtp, newUser);

      return res.status(201).json({
        code: 201,
        data: newUser.email,
      });
    } catch (err) {
      return res.status(500).json({
        code: 500,
        data: err.message,
      });
    }
  },

  validAccount: async (req, res) => {
    try {
      const userId = req.user.userId;
      const otpType = req.user.type;
      if (otpType == "Signup") {
        const active_user = await User.findOneAndUpdate(
          {
            _id: userId,
          },
          {
            $set: {
              is_active: true,
              otp: "",
              otp_exp: "",
            },
          }
        );
        if (!active_user)
          return res.status(404).json({
            code: 404,
            data: "Cannot find this user!",
          });

        if (active_user)
          return res.status(201).json({
            code: 201,
            data: "Your account is now ready to use",
          });
      }
      if (otpType == "ForgotPassword") {
        const forgot_user = await User.findById({
          _id: userId,
        });
        if (!forgot_user)
          return res.status(404).json({
            code: 404,
            data: "Cannot find this user!",
          });
        if (forgot_user)
          return res.status(200).json({
            code: 200,
            data: "You can change your password now!",
          });
      }
    } catch (err) {
      res.status(500).json({
        code: 500,
        data: err.message,
      });
    }
  },

  signIn: async (req, res) => {
    try {
      const user = await User.findOne({
        email: req.body.email,
      });

      if (!user)
        return res
          .status(404)
          .json({ code: 404, status: "Cannot find this email!" });
      if (!user.password)
        return res
          .status(404)
          .json(
            "This email doesn't have a password, it may an google account, please try sign in with Google"
          );
      const validPassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!validPassword)
        return res.status(400).json({ code: 400, status: "Wrong password!" });

      if (!user.is_active)
        return res.status(404).json({
          code: 404,
          status:
            "This account isn't verify yet, please verify it before access to our application",
        });

      if (user && validPassword) {
        const accessToken = helpers.generateAccessToken(user);
        const refreshToken = await helpers.generateRefreshToken(user);
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
        data: error.message,
      });
    }
  },

  logOut: async (req, res) => {
    try {
      const deleted_token = await User.findByIdAndUpdate(req.idDecoded, {
        $set: {
          refresh_token: "",
        },
      });
      if (!deleted_token)
        return res.status(400).json({
          code: 400,
          data: "Something went wrong, try again later!",
        });
      res.clearCookie("accesstoken");
      res.clearCookie("refreshtoken");
      res.status(200).json({
        code: 200,
        data: "Logout successful",
      });
    } catch (error) {
      return res.status(500).json({
        code: 500,
        data: error.message,
      });
    }
  },

  requestRefreshToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshtoken;
      console.log(refreshToken);
      if (!refreshToken)
        return res
          .status(402)
          .json({ code: 402, data: "You are not authenticated" });

      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_KEY,
        async (err, user) => {
          if (err) console.log(err);
          const userDb = await User.findById(user.id);
          if (!userDb) {
            return res.status(404).json({ code: 404, data: "User not found" });
          }
          const newAccessToken = helpers.generateAccessToken(userDb);
          const newRefreshToken = await helpers.generateRefreshToken(userDb);

          const updateRefreshToken = await User.findOneAndUpdate(
            {
              _id: user.userId,
            },
            {
              $set: {
                refresh_token: newRefreshToken,
              },
            },
            {
              new: true,
            }
          );
          res.cookie("refreshtoken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict",
          });
          res.cookie("accesstoken", newAccessToken, {
            secure: false,
            path: "/",
            sameSite: "strict",
          });

          res.status(200).json({
            code: 200,
            data: "Reset successfully",
          });
        }
      );
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: error.message,
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const user = await User.findOne({
        email: req.body.email,
      });
      if (!user)
        return res
          .status(404)
          .json({ code: 404, data: "Cannot find this email!" });

      const resetOtp = otpGenerated();

      const updatedUser = await User.findOneAndUpdate(
        {
          email: req.body.email,
        },
        {
          $set: {
            resetPasswordToken: resetOtp,
            resetPasswordExpires: Date.now() + 15 * 60 * 1000,
          },
        }
      );

      if (!updatedUser)
        return res
          .status(400)
          .json({ code: 400, data: "Something went wrong, try again later!" });

      await new Email(updatedUser).sendOTPResetPassword(resetOtp, updatedUser);

      return res.status(200).json({
        code: 200,
        data: "The reset OTP has been sent to user",
      });
    } catch (error) {
      return res.status(500).send({
        code: 500,
        data: err.message,
      });
    }
  },

  resendOtpNewUser: async (req, res) => {
    try {
      const user = await User.findOne({
        email: req.body.email,
      });
      if (!user)
        return res.status(404).json({
          code: 404,
          error: "Cannot find this email",
        });

      if (user.is_active)
        return res.status(404).json({
          code: 404,
          error: "This user is already active",
        });
      console.log(user);
      console.log(user.is_active);
      newOtp = otpGenerated();

      const updatedUser = await User.findOneAndUpdate(
        {
          email: req.body.email,
        },
        {
          $set: {
            otp: newOtp,
            otp_exp: Date.now() + 15 * 60 * 1000,
          },
        }
      );

      await new Email(updatedUser).reSendOtpNewUser(newOtp, updatedUser);

      res.status(200).json({
        code: 200,
        data: "The reset OTP has been sent to user",
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          code: 400,
          error: "Duplicate email address",
        });
      }
      res.status(500).json({
        code: 500,
        data: error.message,
      });
    }
  },

  signInWithSocial: async (req, res) => {
    try {
      const userInfo = req.body;

      const isExistingEmail = await User.findOne({ email: userInfo.email });

      if (isExistingEmail) {

        const accessToken = helpers.generateAccessToken(isExistingEmail);
        const refreshToken = await helpers.generateRefreshToken(
          isExistingEmail
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
        } = isExistingEmail._doc;
        return res.status(200).json({ code: 200, data: others });
      } else {
        const newUser = await User.create({
          email: userInfo.email,
          name: userInfo.name,
          photo: userInfo.photo,
          is_active: true,
        });

        const accessToken = helpers.generateAccessToken(newUser);
        const refreshToken = await helpers.generateRefreshToken(newUser);
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
        } = newUser._doc;
        return res.status(201).json({
          code: 201,
          data: others,
        });
      }
    } catch (error) {
      return res.status(500).json({ code: 500, data: error.message });
    }
  },
};

module.exports = authController;
