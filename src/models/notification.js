const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  receiver_id: [
    {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  task_id: { type: Schema.Types.ObjectId },
  type: {
    type: String,
    enum: ["housework", "moving", "time"],
  },
  message: {
    type: String,
  },
});

const notification = mongoose.model("notification", notificationSchema);

module.exports = notification;
