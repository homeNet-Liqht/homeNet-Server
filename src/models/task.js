const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = new Schema({
  assigner: {
    type: Schema.Types.ObjectId,
    require,
    ref: "Users",
  },
  assignees: [
    {
      type: Schema.Types.ObjectId,
      require,
      ref: "Users",
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
    required: true,
    validate: {
      validator: function (value) {
        return value.getTime() > Date.now();
      },
      message: (props) => `Start time must be greater than the current date`,
    },
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value.getTime() - this.startTime.getTime() >= 2 * 60 * 60 * 1000;
      },
      message: (props) =>
        `End time must be at least 2 hours greater than the start time`,
    },
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
    enum: ["accepting", "pending", "finished", "cancelled"],
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

const task = mongoose.model("Task", taskSchema);

module.exports = task;
