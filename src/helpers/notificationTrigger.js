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
          status: { $in: ["pending", "time"] },
        },
      ],
    });

    if (!tasksInDay || tasksInDay.length === 0) return;

    console.log(tasksInDay);

    for (const task of tasksInDay) {
      const endTime = new Date(task.endTime);
      console.log(
        "hour database, realtime",
        endTime.getUTCHours(),
        getDateInfo.hour
      );
      console.log(
        "minute database, realtime",
        endTime.getUTCMinutes(),
        getDateInfo.minute
      );

      if (
        getDateInfo.hour > endTime.getHours() ||
        (endTime.getUTCHours() === getDateInfo.hour &&
          getDateInfo.minute > endTime.getUTCMinutes())
      ) {
        await Task.findByIdAndUpdate(task._id, {
          $set: { status: "missing" },
        });
      }
      const endTimeInfoFormat = getDateInfo.minute = 0 ? 60 : getDateInfo.minute;
      console.log(endTimeInfoFormat);
      if (
        task.status !== "time" &&
        endTime.getUTCHours() === getDateInfo.hour &&
        endTimeInfoFormat - 5 >= endTime.getUTCMinutes()
      ) {
        console.log("a");
        for (const assigneeId of task.assignees) {
          const user = await User.findById(assigneeId);
          if (user && user.fcmToken && user.fcmToken.length > 0) {
            for (const token of user.fcmToken) {
              try {
                const sendingMessage = notificationContain(
                  "time",
                  task.assigner,
                  assigneeId,
                  task.title
                );

                await sendNotification.sendNotification(token, sendingMessage);
              } catch (sendError) {
                console.error("Error sending notification:", sendError);
              }
            }
          }
        }

        const updatedTask = await Task.findByIdAndUpdate(task._id, {
          $set: { status: "time" },
        });
        console.log(updatedTask);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { alert };
