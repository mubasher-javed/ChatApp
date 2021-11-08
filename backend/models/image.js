import mongoose from "mongoose";

const imageSchema = mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  createAt: { type: Date, default: Date.now },
  path: String,
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Image = mongoose.model("Image", imageSchema);
export default Image;
