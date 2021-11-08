import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  createAt: { type: Date, default: Date.now },
  body: { type: String, required: false },
  imgPath: { type: String, required: false },
  videoPath: { type: String, required: false },
  audioPath: { type: String, required: false },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
