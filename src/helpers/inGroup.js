const familyGroup = require("../models/familyGroup");

const checkIsInAGroup = async (id) => {
  try {
    const group = await familyGroup.findOne({
      members: { $in: [id] },
    });
    if (!group) return false;

    return true;
  } catch (error) {
    console.log(error);
  }
};


module.exports = checkIsInAGroup