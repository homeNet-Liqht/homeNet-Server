const {
    verifyAccessToken
} = require("../helpers/jwt");
const User = require("../models/user")

const checkAuthorization = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accesstoken;


        if (!accessToken) return res.status(402).json("You are not authenticated")

        const decoded = verifyAccessToken(accessToken);
        if (decoded.exp * 1000 < Date.now()) return res.status(403).json("Your token was expired")
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json("User was not found");

        if (user.id != req.params.uid) return res.status(403).json("You all now allow to do that");

        req.userData = user;

        next();
    } catch (error) {
        res.status(500).json(error)
    }

}

module.exports = {
    checkAuthorization
}