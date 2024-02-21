const cookie = require("cookie");
const User = require("../models/user");
const {
    verifyAccessToken
} = require("../helpers/jwt");

const checkAuthentication = async (req, res, next) => {
    try {
        const token = req.headers.cookie;
        const cookies = cookie.parse(token || "");
        const accessToken = cookies.accesstoken;
        const decoded = verifyAccessToken(accessToken);

        if (!token) return res.status(404).json("Your token was not found");

        if (decoded.exp * 1000 < Date.now() ) return res.status(403).json("Your token was expired")
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json("User was not found");

        req.userData = user;
        console.log("Token is still valid");
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json("error")
    }
}

module.exports = {
    checkAuthentication
}