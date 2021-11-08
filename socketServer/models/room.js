const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = Schema({
  user1: { type: Schema.Types.ObjectId, ref: "User" },
  user2: { type: Schema.Types.ObjectId, ref: "User" },
});

// todo: add room validation with Joi
exports.Room = mongoose.model("Room", roomSchema);
