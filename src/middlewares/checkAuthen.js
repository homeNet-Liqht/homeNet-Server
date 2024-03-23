const cookie = require("cookie");
const User = require("../models/user");
const { verifyAccessToken } = require("../helpers/jwt");

const checkAuthentication = async (req, res, next) => {
  try {
    const token = req.headers.cookie;
    const cookies = cookie.parse(token || "");
    const accessToken = cookies.accesstoken;
    const decoded = verifyAccessToken(accessToken);

    if (!token)
      return res.status(404).json({
        code: 404,
        data: "Your token was not found",
      });


      if (decoded.exp * 1000 < Date.now())
      return res
        .status(403)
        .json({ code: 403, data: "Your token was expired" });

    req.idDecoded = decoded.id;
    console.log("Token is still valid");
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      data: error.message,
    });
  }
};

module.exports = {
  checkAuthentication,
};
