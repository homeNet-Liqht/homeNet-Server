const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const zoneSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: "User" },
  lat: { type: Number, default: 0 },
  long: { type: Number, default: 0 },
  radius: { type: Number, default: 0 },
  safeTime: { type: Date },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
});

const Zone = mongoose.model("Zone", zoneSchema);
module.exports = Zone;
