const User = require("../models/user");
const Notification = require("../models/notification");
const Task = require("../models/task");
const notificationController = {
  sending: async (req, res) => {
    try {
      const isInFam = await User.find({ _id: { $in: req.body.receiver } });
      const sender = await User.findById(req.idDecoded);
      const task = await Task.findById(req.body.task_id);
      if (!isInFam)
        return res
          .status(404)
          .json({ code: 404, data: "User isn't in the fam, try again later" });

      const sendingMessage =
        req.body.type == "housework"
          ? `${sender.name} has sent you a housework: ${task.title}`
          : req.body.type == "moving"
          ? `${sender.name} has sent you a moving task: ${task.title}`
          : "";
      const newNotification = await Notification.create({
        sender_id: req.idDecoded,
        receiver_id: req.body.receiver,
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
