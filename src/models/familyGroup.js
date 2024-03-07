const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const familyGroupSchema = new Schema({
  familyName: {
    type: String,
    require: [true, "Family Name is a required field"],
  },
  photo: {
    type: String,
  },
  host: { type: Schema.Types.ObjectId, ref: "Users" },
  members: [{ type: Schema.Types.ObjectId, ref: "Users" }],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const familyGroup = mongoose.model("FamilyGroup", familyGroupSchema);

module.exports = familyGroup;
