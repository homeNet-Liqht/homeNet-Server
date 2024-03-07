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

const checkIsInAssignerGroup = async (assignerId, assigneeId) => {
  try {
    const assignerGroup = await familyGroup.findOne({
      members: { $in: [assignerId] },
    });
    const isAssigneeInThisGroup = assignerGroup.members.includes(assigneeId);
    if (!isAssigneeInThisGroup) return false;
    return true;
  } catch (error) {
    console.log(error.message)
  }
};

module.exports = {checkIsInAGroup, checkIsInAssignerGroup};
