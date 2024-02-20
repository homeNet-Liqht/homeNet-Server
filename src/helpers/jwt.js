const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_ACCESS_KEY,
    { expiresIn: "30s" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_KEY,
    { expiresIn: "30d" }
  );
};

const verifyAccessToken = (access_token) => {
  token = access_token;
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      const decoded = jwt.decode(token);
      return {
        exp: decoded.exp,
        userId: decoded.userId,
      };
    }
  }
};

const verifyRefreshToken = (refresh_token) => {
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const decoded = jwt.verify(refresh_token, secret);
    return decoded;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return {
        expired: true,
      };
    }
    console.log(err);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
