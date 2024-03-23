const User = require("../models/user");
const Notification = require("../models/notification");
const Task = require("../models/task");
const FamilyGroup = require("../models/familyGroup");
const { sendNotification } = require("../utils/sendingNoti");
const notificationContain = require("../utils/notificationText");
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

      if (
        req.body.type === "task" ||
        req.body.type === "update" ||
        req.body.type === "finish" ||
        req.body.type === "delete"
      ) {
        const isAssigner = await Task.findById(req.body.task_id);

        if (!isAssigner || isAssigner.assigner != req.idDecoded) {
          return res.status(401).json({
            code: 401,
            data: "Sender isn't the assigner of this task",
          });
        }

        const isInTask = await Task.findOne({
          _id: req.body.task_id,
          assignees: { $in: receivers },
        });

        if (!isInTask) {
          return res.status(404).json({
            code: 404,
            data: "There is someone who isn't in this task",
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

      console.log("Send FCM Token");
      for (const assigneeId of receivers) {
        const assignee = await User.findById(assigneeId);
        if (assignee && assignee.fcmToken && assignee.fcmToken.length > 0) {
          for (const token of assignee.fcmToken) {
            const sendingMessage = notificationContain(
              req.body.type,
              sender.name,
              assignee.name,
              taskTitle
            );
            await sendNotification(token, sendingMessage);
          }
        }
      }
      console.log("Send FCM Token success");

      const newNotification = await Notification.create({
        sender_id: req.idDecoded,
        receiver_id: req.body.receivers,
        type: req.body.type,
        message: JSON.stringify(sendingMessage),
      });

      if (!newNotification) {
        return res.status(400).json({
          code: 400,
          data: "Something went wrong, try again later!",
        });
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

  alert: async () => {
    try {
      const currentDate = new Date();
      const getDateInfo = {
        year: currentDate.getUTCFullYear(),
        month: currentDate.getUTCMonth() + 1,
        day: currentDate.getUTCDate(),
        time: currentDate.getUTCHours(),
        minute: currentDate.getUTCMinutes(),
      };
      
      console.log(getDateInfo);
      const tasksInDay = await Task.find({
        $expr: {
          $and: [
            { $eq: [{ $year: "$endTime" }, getDateInfo.year] },
            { $eq: [{ $month: "$endTime" }, getDateInfo.month] },
            { $eq: [{ $dayOfMonth: "$endTime" }, getDateInfo.day] },
          ],
        },
      });

      if (!tasksInDay) return;

      const filteredTasks = tasksInDay.filter((task) => {
        const endTime = new Date(task.endTime);
        return (
          (endTime.getHours() > getDateInfo.time ||
            (endTime.getHours() === getDateInfo.time &&
              endTime.getMinutes() > getDateInfo.minute)) &&
          task.status === "pending" &&
          task.status === "accepting"
        );
      });
      console.log(filteredTasks);
      const updateTaskStatus = filteredTasks.map(async (task) => {
        if (task.endTime > Date.now()) {
          await Task.findByIdAndUpdate(task._id, {
            $set: { status: "missing" },
          });
        }

        if (task.endTime > Date.now() - 5) {
          task.assignees.map(async (assignee) => {
            const assignees = await User.findById(assignee._id);
            assignees.map(async (assignee) => {
              if (
                assignee &&
                assignee.fcmToken &&
                assignee.fcmToken.length > 0
              ) {
                for (const token of assignee.fcmToken) {
                  const sendingMessage = notificationContain(
                    "time",
                    task.assigner,
                    assignee.id,
                    task.title
                  );

                  await sendNotification(token, sendingMessage);
                }
              }
            });
          });
        }
      });

      console.log(updateTaskStatus);
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = notificationController;
