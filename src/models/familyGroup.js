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
  member: [{ type: Schema.Types.ObjectId, ref: "Users" }],
});

const familyGroup = mongoose.model("FamilyGroup", familyGroupSchema)

module.exports = familyGroup