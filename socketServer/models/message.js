import mongoose from "mongoose";
const Schema = mongoose.Schema;

const messageSchema = Schema({
  roomId: { type: Schema.Types.ObjectId, ref: "Room" },
  createAt: { type: Date, default: Date.now },
  body: { type: String, required: false },
  imgPath: { type: String, required: false },
  senderId: { type: Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: Schema.Types.ObjectId, ref: "User" },
});

// todo: add validation form Message model
const Message = mongoose.model("Message", messageSchema);
export default Message;
