const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = new Schema({
  assigner: {type: Schema.Types.ObjectId,require,ref: "User",},
  assignees: [{type: Schema.Types.ObjectId,require,ref: "User",},],
  title: {type: String,},description: {type: String,require,},
  startTime: {type: Date,},
  endTime: {type: Date,},
  location: [{title: { type: String },address: { type: String },},],
  actualStartTime: {type: Date,},
  actualEndTime: {type: Date,},
  status: {type: String,enum: ["accepting", "pending", "finished", "missing"],default: "accepting",},
  photo: [{ type: String }],
  created_at: {type: Date,default: Date.now,},
  updated_at: {type: Date,default: Date.now,},
});



const task = mongoose.model("Task", taskSchema);

module.exports = task;
