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
          status: { $in: ["pending"] },
        },
      ],
    });
    if (!tasksInDay) return;
    console.log(tasksInDay);

    const updateTaskStatus = await Promise.all(tasksInDay.map(async (task) => {
        const endTime = new Date(task.endTime);
        console.log(endTime.getUTCHours());


        if (endTime.getUTCHours() > getDateInfo.hour && endTime.getUTCMinutes() > getDateInfo.minute) {
          await Task.findByIdAndUpdate(task._id, {
            $set: { status: "missing" },
          });
        }
        console.log("task time", endTime.getUTCHours(),  endTime.getUTCMinutes());
        console.log("current time", getDateInfo.hour, getDateInfo.minute, getDateInfo.minute - 5 );
        if (endTime.getUTCHours() == getDateInfo.hour && endTime.getUTCMinutes() >= getDateInfo.minute - 5) {
          await Promise.all(task.assignees.map(async (assignee) => {
            const user = await User.findById(assignee._id);

            if (user && user.fcmToken && user.fcmToken.length > 0) {
              for (const token of user.fcmToken) {
                const sendingMessage = notificationContain(
                  "time",
                  task.assigner,
                  assignee.id,
                  task.title
                );

                await sendNotification.sendNotification(token, sendingMessage);
              }
            }

            const statusUpdate = Task.findByIdAndUpdate(task._id, {$set :{status : "time"}})
            console.log(statusUpdate);
          }));
        }
      }));

    console.log(updateTaskStatus);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { alert };
