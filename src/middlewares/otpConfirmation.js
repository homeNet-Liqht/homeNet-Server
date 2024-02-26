const User = require("../models/user");
const otpConfirmation = async (req, res, next) => {
  try {
    const userId =  req.params.uid;
    const clientOtp =  req.body.otp;
    const user = await otpChecking(userId);

    if (user.otp_exp < Date.now()) {
      return res.status(403).json("Your token is expired");
    }

    if (user.otp !== clientOtp) {
      return res.status(403).json("This OTP is not right, try again!");
    }

    req.userId = user.id;
    next();

  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const otpChecking = async (id) => {
  try {
    const user = await User.findOne({ id: id });

    if (!user) {
      throw new Error("User not found");
    }

    
    if (user.resetPasswordToken) {
      return {
        id: user.id,
        otp: user.resetPasswordToken,
        otp_exp: user.resetPasswordExpires
      };
    }

    if (user.otp) {
      return {
        id: user.id,
        otp: user.otp,
        otp_exp: user.otp_exp
      };
    }

  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = otpConfirmation;
