import mongoose from "mongoose";
const roomSchema = mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Room = mongoose.model("Room", roomSchema);
export default Room;
