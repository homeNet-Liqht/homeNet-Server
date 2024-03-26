const Task = require("../models/task");
const User = require("../models/user");
const notificationContain = require("../utils/notificationText");
const sendNotification = require("../utils/sendingNoti");

const alert = async () => {
  try {
    const currentDate = new Date();
    const getDateInfo = {
      year: currentDate.getUTCFullYear(),
      month: currentDate.getUTCMonth() + 1,
      day: currentDate.getUTCDate(),
      hour: currentDate.getUTCHours(),
      minute: currentDate.getUTCMinutes(),
    };

    console.log(getDateInfo);
    const tasksInDay = await Task.find({
      $and: [
        {
          $expr: {
            $and: [
              { $eq: [{ $year: "$endTime" }, getDateInfo.year] },
              { $eq: [{ $month: "$endTime" }, getDateInfo.month] },
              { $eq: [{ $dayOfMonth: "$endTime" }, getDateInfo.day] },
            ],
          },
        },
        {
          status: { $in: ["pending", "time"] }, // Including "time" status tasks
        },
      ],
    });

    if (!tasksInDay || tasksInDay.length === 0) return;

    console.log(tasksInDay);

    for (const task of tasksInDay) {
      const endTime = new Date(task.endTime);
      console.log("endTime", endTime.getUTCHours());

      if (
        endTime.getUTCHours() > getDateInfo.hour ||
        (endTime.getUTCHours() === getDateInfo.hour &&
          endTime.getUTCMinutes() > getDateInfo.minute)
      ) {
        await Task.findByIdAndUpdate(task._id, {
          $set: { status: "missing" },
        });
      }

      if (
        task.status !== "time" &&
        endTime.getUTCHours() === getDateInfo.hour &&
        endTime.getUTCMinutes() >= getDateInfo.minute - 5
      ) {
        for (const assigneeId of task.assignees) {
          const user = await User.findById(assigneeId);

          if (user && user.fcmToken && user.fcmToken.length > 0) {
            for (const token of user.fcmToken) {
              const sendingMessage = notificationContain(
                "time",
                task.assigner,
                assigneeId,
                task.title
              );

              await sendNotification.sendNotification(token, sendingMessage);
            }
          }
        }

        await Task.findByIdAndUpdate(task._id, {
          $set: { status: "time" },
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { alert };
