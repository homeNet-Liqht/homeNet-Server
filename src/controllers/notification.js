const User = require("../models/user");
const Notification = require("../models/notification");
const Task = require("../models/task");
const FamilyGroup = require("../models/familyGroup");
const { sendNotification } = require("../utils/sendingNoti");
const notificationContain = require("../utils/notificationText");
const notification = require("../models/notification");
const notificationController = {
  sending: async (req, res) => {
    try {
      const sender = await User.findById(req.idDecoded);
      const receivers = req.body.receivers;
      if (req.body.type === "invite" || req.body.type === "join") {
        const receiver = await FamilyGroup.find({
          members: { $in: receivers },
        });
        if (receiver && receiver.length > 0) {
          return res.status(401).json({
            code: 401,
            data: "There is at least one person who has joined a family",
          });
        }
      }

      let taskTitle = "";
      if (
        req.body.type === "task" ||
        req.body.type === "accept" ||
        req.body.type === "update" ||
        req.body.type === "finish" ||
        req.body.type === "delete"
      ) {
        const taskObj = await Task.findById(req.body.task_id);
        taskTitle = taskObj ? taskObj.title : "";
      }
      for (const assigneeId of receivers) {
        const assignee = await User.findById(assigneeId);
        if (assignee && assignee.fcmToken && assignee.fcmToken.length > 0) {
          if (assignee._id == req.idDecoded) continue
          for (const token of assignee.fcmToken) {
            const sendingMessage = notificationContain(
              req.body.type,
              sender.name,
              assignee.name,
              taskTitle
            );
            await sendNotification(token, sendingMessage);
            console.log("Send FCM Token success");

            const newNotification = await Notification.create({
              sender_id: req.idDecoded,
              receiver_id: req.body.receivers,
              type: req.body.type,
              message: `${sendingMessage.title}: ${sendingMessage.body}`,
            });
            if (!newNotification) {
              return res.status(400).json({
                code: 400,
                data: "Something went wrong, try again later!",
              });
            }
          }
        }
      }

      return res.status(201).json({
        code: 201,
        data: "New message has been sent!",
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      return res.status(500).json({ code: 500, data: "Server error" });
    }
  },

  show: async (req, res) => {
    try {
      const notifications = await notification.find({
        receiver_id: { $in: [req.idDecoded] },
      });

      if (!notifications || notifications.length === 0)
        return res
          .status(404)
          .json({ code: 404, data: "There are no notifications to show" });
      return res.status(200).json({ code: 200, data: notifications });
    } catch (error) {
      return res.status(500).json({code: 500, data: error})
    }
  },
};

module.exports = notificationController;
