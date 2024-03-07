const { uploadImages } = require("../config/firebase/storage");
const {
  checkIsInAGroup,
  checkIsInAssignerGroup,
} = require("../helpers/inGroup");
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
          const isInAGroup = await checkIsInAssignerGroup(
            req.idDecoded,
            assignee
          );
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
        assigner: req.idDecoded,
        assignees: assignees,
        title: req.body.title,
        startTime: startTime,
        endTime: endTime,
        actualStartTime: startTime,
        actualEndTime: endTime,
        description: req.body.description,
        photo: downloadURLs,
      });

      if (newTask) return res.status(200).json(assignees);
    } catch (error) {
      console.error("An error occurred:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },
  edit: async (req, res) => {
    console.log(req.userData);
    try {
      const theTask = await task.findById(req.params.tid);

      if (!theTask)
        return res.status(404).json({
          code: 404,
          data: "Cannot find this task, please try again later!",
        });
      if (req.userData.id != theTask.assigner) {
        return res
          .status(402)
          .json({ code: 402, data: "You're not an assigner in this task" });
      }
      const checkingAssigner = await checkIsInAGroup(req.userData._id);
      if (!checkingAssigner) {
        return res
          .status(403)
          .json({ code: 403, data: "This user isn't in a group yet" });
      }
      const assignees = req.body.assignees.split(",");

      const checkingAssignees = await Promise.all(
        assignees.map(async (assignee) => {
          const isInAGroup = await checkIsInAssignerGroup(
            req.idDecoded,
            assignee
          );
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
      const endTime = new Date(req.body.endTime);

      if (startTime.getTime() < Date.now()) {
        return res
          .status(418)
          .json({ code: 418, data: "You cannot pick the time from the past" });
      }

      if (endTime.getTime() < startTime.getTime()) {
        return res.status(418).json({
          code: 418,
          data: "The end time must be greater than the start time",
        });
      }
      const downloadURLs = await uploadImages(req.files);

      const updatedTask = await task.findByIdAndUpdate(req.params.tid, {
        assignees: assignees,
        title: req.body.title,
        startTime: startTime,
        endTime: endTime,
        actualStartTime: startTime,
        actualEndTime: endTime,
        description: req.body.description,
        photo: downloadURLs,
      });

      if (updatedTask) {
        return res
          .status(200)
          .json({ code: 200, data: "Task updated successfully" });
      }
    } catch (error) {
      res.status(500).json({ code: 500, data: error.message });
    }
  },
};

module.exports = taskController;