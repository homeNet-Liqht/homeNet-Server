const { uploadImages } = require("../config/firebase/storage");
const checkIsInAGroup = require("../helpers/inGroup");
const task = require("../models/task");

const taskController = {
  create: async (req, res) => {
    try {
      const checkingAssigner = await checkIsInAGroup(req.idDecoded);

      if (!checkingAssigner) {
        return res
          .status(403)
          .json({ code: 403, data: "This user isn't in a group yet" });
      }

      const assignees = req.body.assignees.split(",");

      const checkingAssignees = await Promise.all(
        assignees.map(async (assignee) => {
          const isInAGroup = await checkIsInAGroup(assignee);
          return isInAGroup;
        })
      );

      if (checkingAssignees.includes(false)) {
        return res.status(403).json({
          code: 403,
          data: "There are some people who aren't in this group!",
        });
      }
      const startTime = new Date(req.body.startTime);
      if (startTime.getTime() < Date.now()) {
        return res
          .status(418)
          .json({ code: 418, data: "You cannot pick the time from the past" });
      }
      const endTime = new Date(req.body.endTime);
      if (endTime.getTime() < startTime.getTime())
        return res.status(418).json({
          code: 418,
          data: "The end time must greater than the start time",
        });
      const downloadURLs = await uploadImages(req.files);
      const newTask = task.create({
        assignees: req.idDecoded,
        assignees: assignees,
        startTime: startTime,
        endTime: endTime,
        description: req.body.description,
        photo: downloadURLs,
      });

      if (newTask) return res.status(200).json(assignees);
    } catch (error) {
      console.error("An error occurred:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = taskController;
