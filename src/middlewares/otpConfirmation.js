const User = require("../models/user");

const otpConfirmation = async (req, res, next) => {
  try {
    const user = await otpChecking(req.body.email, req.body.type);

    if (!user)
      return res.status(404).json({
        code: 404,
        data: "Cannot find this user",
      });

    const clientOtp = req.body.otp;

    if (user.otp_exp < Date.now()) {
      return res.status(400).json({
        code: 400,
        data: "Your token is expired",
      });
    }

    if (user.otp !== clientOtp) {
      return res.status(404).json({
        code: 404,
        data: "This OTP is not right, try again!",
      });
    }

    req.user = {
      userId: user.id,
      type: req.body.type,
    };
    next();
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: error.message,
    });
  }
};

const otpChecking = async (email, type) => {
  try {
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (type == "Signup") {
      return {
        id: user.id,
        otp: user.otp,
        otp_exp: user.otp_exp,
      };
    }

    if (type == "ForgotPassword") {
      return {
        id: user.id,
        otp: user.resetPasswordToken,
        otp_exp: user.resetPasswordExpires,
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = otpConfirmation;
