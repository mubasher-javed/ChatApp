import config from "config";
import cors from "cors";
import express, { json, urlencoded } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import multer from "multer";
import Message from "./models/message.js";
import Room from "./models/room.js";
import auth from "./routes/auth.routes.js";
import users from "./routes/users.routes.js";

const ObjectId = mongoose.Types.ObjectId;
const app = express();

if (!config.get("privateKey")) {
  console.error("Provide secret key before first.");
  process.exit(1);
}

const port = 8000;
mongoose
  .connect("mongodb://localhost/chatApp")
  .then(() => {
    console.log("connected to mongodb...");
  })
  .catch((error) => {
    console.error(error);
  });

// File upload settings
const imagePath = "./public/images";
const videoPath = "./public/videos";
const audioPath = "./public/audios";

function getStorage(path) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path);
    },
    filename: (req, file, cb) => {
      let originalName = file.originalname;
      if (path === audioPath) {
        cb(null, Date.now() + "-" + originalName + ".wav");
        return;
      }
      cb(null, Date.now() + "-" + originalName);
    },
  });
}

let imgUpload = multer({
  storage: getStorage(imagePath),
});

let videoUpload = multer({
  storage: getStorage(videoPath),
});

let audioUpload = multer({
  storage: getStorage(audioPath),
});
// middleware
app.use(json());
app.use(express.static("public"));
app.use(urlencoded({ extended: true }));
app.use(cors({ exposedHeaders: ["x-auth-token"] }));
app.use(morgan("tiny"));
app.use("/api/users", users);
app.use("/api/login", auth);

// POST File
// app.post("/api/upload/image", imgUpload.single("image"), async (req, res) => {
//   let { senderId, receiverId, roomId } = req.body;
//   if (!req.file) return res.send({ success: false });

//   const message = new Message({
//     senderId: senderId,
//     receiverId,
//     roomId,
//     imgPath: `http://localhost:${port}/images/${req.file.filename}`,
//   });
//   await message.save();
//   return res.send({ success: true, data: message });
// });

app.post("/api/upload/image", async (req, res) => {
  let { sender, receiver, roomId, imgPath } = req.body;
  // if (!req.file) return res.send({ success: false });
  console.log("received data is", req.body);
  const message = new Message({
    senderId: sender._id,
    receiverId: receiver._id,
    roomId: roomId.roomId,
    imgPath,
  });
  await message.save();
  return res.send({ success: true, data: message });
});

app.post("/api/upload/audio", audioUpload.single("audio"), async (req, res) => {
  let { senderId, receiverId, roomId } = req.body;

  console.log("received room id is:", req.body);
  if (!req.file) {
    console.log("No audio is available!");
    return res.send({ success: false });
  }
  console.log("audio received", req.file);
  const message = new Message({
    senderId: senderId,
    receiverId,
    roomId: roomId.roomId,
    audioPath: `http://localhost:${port}/audios/${req.file.filename}`,
  });
  await message.save();
  return res.send({ success: true, data: message });
});

app.post("/api/upload/video", videoUpload.single("video"), async (req, res) => {
  let { senderId, receiverId, roomId } = req.body;
  if (!req.file) return res.send({ success: false });

  console.log("Video is available!");
  const message = new Message({
    senderId,
    receiverId,
    roomId,
    videoPath: `http://localhost:${port}/videos/${req.file.filename}`,
  });
  await message.save();
  return res.send({ success: true, data: message });
});

// todo: add room validation with Joi
app.post("/api/createRoom", async (req, res) => {
  let senderId = new ObjectId(req.body.senderId);
  let receiverId = new ObjectId(req.body.receiverId);
  // try to get the room with given data
  let room = await Room.findOne({
    $or: [
      {
        user1: senderId,
        user2: receiverId,
      },
      {
        user1: receiverId,
        user2: senderId,
      },
    ],
  });

  // create chatRoom if not exists
  if (!room) {
    let newRoom = Room({ user1: senderId, user2: receiverId });
    await newRoom.save();
    return res.send({ roomId: newRoom._id });
  }
  res.send({ roomId: room._id });
});

app.get("/api/messages/:senderId/:receiverId", async (req, res) => {
  const senderId = new ObjectId(req.params.senderId);
  const receiverId = new ObjectId(req.params.receiverId);
  const result = await Message.find({
    $or: [
      {
        senderId: senderId,
        receiverId: receiverId,
      },
      {
        senderId: receiverId,
        receiverId: senderId,
      },
    ],
  });
  res.send(result);
});

app.listen(port, () => {
  console.log(`Listening on localhost port ${port}`);
});
