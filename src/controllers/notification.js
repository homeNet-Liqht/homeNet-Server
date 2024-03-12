const User = require("../models/user");
const Notification = require("../models/notification");
const Task = require("../models/task");
const FamilyGroup = require("../models/familyGroup");
const { firebaseAdmin } = require("../config/firebase/admin");

const sendNotification = async (title, body) => {
  try {
    const send = await firebaseAdmin.messaging().send({
      token:
        "f1CUMUe6T2q7Sox0qOnPSB:APA91bFse1g3w_YVsRu0AIsRCAZt2XbgjCF8F7JnhP-foJZtupCsIwEUq6GC9xqLX1y_gDXsrSneXG1bD-HMlbIh4xa7f5YPMm17o7jkLL-v9KUwgaHm91XxEGaM9BJBG53rcyeokCw1",
      notification: {
        title: title || "",
        body: body || "",
      },
    });
    console.log("send successful", send);
  } catch (error) {
    console.log("err",error);
  }
};

const notificationController = {
  sending: async (req, res) => {
    try {
      const isInFam = await FamilyGroup.findOne({
        members: { $in: req.body.receivers },
        members: { $in: req.idDecoded },
      });

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
      let titleMessage;
      let sendingMessage;

      if (req.body.type === "housework") {
        sendingMessage = `${sender.name} has sent you a housework: ${task.title}`;
        titleMessage = `New housework from ${sender.name} `;
      } else if (req.body.type === "moving") {
        sendingMessage = `${sender.name} has sent you a moving task: ${task.title}`;
        titleMessage = `New moving from ${sender.name} `;
      } else if (req.body.type === "time") {
        sendingMessage = `${task.title} will be finished in ${timeRemaining} hours`;
        titleMessage = `Alert time in ${task.title} `;
      } else {
        sendingMessage = "";
        titleMessage = "";
      }
      const sendBells = await sendNotification(titleMessage, sendingMessage);
      console.log(sendBells);
      if (!sendBells)
        return res
          .status(409)
          .json({ code: 409, data: "Notification sent fail!" });
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
      res.status(500).json({ code: 500, data: error.message });
    }
  },
};

module.exports = notificationController;
