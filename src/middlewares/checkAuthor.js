const User = require("../models/user");

const checkAuthorization = async (req, res, next) => {
  try {
    console.log(req.idDecoded);

    const user = await User.findById(req.idDecoded);
    if (!user)
      return res.status(404).json({ code: 404, data: "User was not found" });

    console.log(req.idDecoded == req.params.uid);
    if (req.idDecoded != req.params.uid) {
      console.log("wrong");
      return res
        .status(403)
        .json({ code: 403, data: "You are not allow to do that" });
    }

    console.log(user._id == req.params.uid);
    req.userData = user;

    next();
  } catch (error) {
    res.status(500).json({ code: 500, data: error.message });
  }
};

module.exports = {
  checkAuthorization,
};
