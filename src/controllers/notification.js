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
                    data: "At least one person has joined a family",
                });
            }
        }

        let taskTitle = "";
        if (["task", "accept", "update", "finish", "delete"].includes(req.body.type)) {
            const taskObj = await Task.findById(req.body.task_id);
            taskTitle = taskObj ? taskObj.title : "";
        }

        for (const assigneeId of receivers) {
            const assignee = await User.findById(assigneeId);
            if (assignee && assignee.fcmToken && assignee.fcmToken.length > 0 && assignee._id != req.idDecoded) {
                for (const token of assignee.fcmToken) {
                    const sendingMessage = notificationContain(
                        req.body.type,
                        sender.name,
                        assignee.name,
                        taskTitle
                    );
                    await sendNotification(token, sendingMessage);
                    console.log("FCM Token sent successfully");

                    const newNotification = await Notification.create({
                        sender_id: req.idDecoded,
                        receiver_id: assigneeId,
                        type: req.body.type,
                        message: `${sendingMessage.title}: ${sendingMessage.body}`,
                        task_id: req.body.task_id || null
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
        return res.status(200).json({
            code: 200,
            data: "Notifications sent successfully",
        });
    } catch (error) {
        console.error("Error in sending notifications:", error);
        return res.status(500).json({
            code: 500,
            data: "Internal server error",
        });
    }
},


show: async (req, res) => {
  try {
      const notifications = await Notification.find({
          receiver_id: req.idDecoded,
      }).populate("assigner", "photo name");

      if (!notifications || notifications.length === 0) {
          return res.status(404).json({ code: 404, data: "No notifications found" });
      }
      
      return res.status(200).json({ code: 200, data: notifications });
  } catch (error) {
      console.error("Error in fetching notifications:", error);
      return res.status(500).json({ code: 500, data: "Internal server error" });
  }
}
};

module.exports = notificationController;
