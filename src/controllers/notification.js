const User = require("../models/user");
const Notification = require("../models/notification");
const Task = require("../models/task");
const FamilyGroup = require("../models/familyGroup");
const { sendNotification } = require("../utils/sendingNoti");
const notificationController = {
  sending: async (req, res) => {
    try {
      const isInFam = await FamilyGroup.findOne({
        members: { $in: req.body.receivers },
        members: { $in: req.idDecoded },
      });
      const fcmToken = req.body.fcmToken;
      if (!fcmToken)
        return res
          .status(402)
          .json({ code: 402, data: "Couldn't find the id of user's device!" });
      const sender = await User.findById(req.idDecoded);
      const task = await Task.findById(req.body.task_id);
      const isAssigner = await Task.findOne({ assigner: req.idDecoded });
      const isAssignees = req.body.receivers;

      const isOnTask = await Task.findOne({
        _id: req.body.task_id,
        assignees: { $all: isAssignees },
      });

      if (!isInFam)
        return res
          .status(404)
          .json({ code: 404, data: "User isn't in the fam, try again later" });

      if (!isAssigner)
        return res.status(400).json({
          code: 400,
          data: "This user isn't the assigner of the task!",
        });

      if (!isOnTask)
        return res.status(400).json({
          code: 400,
          data: "Assignees aren't all in the task, try again later!",
        });
      const finishTime = task.endTime - Date.now();
      const timeRemaining = Math.ceil(finishTime / (1000 * 60 * 60));

      let sendingMessage;
      let title;
      if (req.body.type === "housework") {
        sendingMessage = `${sender.name} has sent you a housework: ${task.title}`;
        title = `${sender.name} has assigned you a Housework`;
      } else if (req.body.type === "moving") {
        sendingMessage = `${sender.name} has sent you a moving task: ${task.title}`;
        title = `${sender.name} has assign you a Moving Task`;
      } else if (req.body.type === "time") {
        sendingMessage = `${task.title} will be finished in ${timeRemaining} hours`;
        title = `${task.title} is on the duty call`;
      } else {
        sendingMessage = "";
      }
      await sendNotification();
      const newNotification = await Notification.create({
        sender_id: req.idDecoded,
        receiver_id: req.body.receivers,
        type: req.body.type,
        message: sendingMessage,
      });
      if (!newNotification)
        return res
          .status(400)
          .json({ code: 400, data: "Something went wrong, try again later!" });
      return res
        .status(201)
        .json({ code: 201, data: "New message has been sent!" });
    } catch (error) {
      return res.status(500).json({ code: 500, data: "Server error" });
    }
  },
};

module.exports = notificationController;
