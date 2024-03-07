const jwt = require("jsonwebtoken");
const User = require("../models/user");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_ACCESS_KEY,
    {
      expiresIn: "60s",
    }
  );
};

const generateRefreshToken = async (user) => {
  try {
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "30d" }
    );

    await User.findByIdAndUpdate(user._id, { refresh_token: refreshToken });

    return refreshToken;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw error;
  }
};

const verifyAccessToken = (access_token) => {
  token = access_token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    return decoded;
  } catch (err) {
    const decoded = jwt.decode(token);
    return {
      exp: decoded.exp,
      id: decoded.id,
    };
  }
};

const verifyRefreshToken = (refresh_token) => {
  try {
    const secret = process.env.JWT_REFRESH_KEY;
    const decoded = jwt.verify(refresh_token, secret);
    return decoded;
  } catch (err) {
    console.log(err);

    return {
      expired: true,
    };
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
