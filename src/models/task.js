const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = new Schema({
  assigner: {
    type: Schema.Types.ObjectId,
    require,
    ref: "User",
  },
  assignees: [
    {
      type: Schema.Types.ObjectId,
      require,
      ref: "User",
    },
  ],
  title: {
    type: String,
  },
  description: {
    type: String,
    require,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  location: [
    {
      title: { type: String },
      address: { type: String },
    },
  ],
  actualStartTime: {
    type: Date,
  },
  actualEndTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["accepting", "pending", "finished", "missing"],
    default: "accepting",
  },
  photo: [{ type: String }],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

function convertToVietnamTime(date) {
  return moment(date).tz("Asia/Ho_Chi_Minh").toDate();
}

taskSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.updated_at = new Date();
  }

  if (this.startTime) {
    this.startTime = convertToVietnamTime(this.startTime);
  }
  if (this.endTime) {
    this.endTime = convertToVietnamTime(this.endTime);
  }
  if (this.actualStartTime) {
    this.actualStartTime = convertToVietnamTime(this.actualStartTime);
  }
  if (this.actualEndTime) {
    this.actualEndTime = convertToVietnamTime(this.actualEndTime);
  }

  next();
});

const task = mongoose.model("Task", taskSchema);

module.exports = task;
