import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import Message from "./models/message.js";

let app = express();
let server = http.Server(app);
let io = new Server(server);
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose
  .connect("mongodb://localhost/chatApp")
  .then(() => {
    console.log("connected to mongodb...");
  })
  .catch((error) => {
    console.error(error);
  });

io.on("connection", (socket) => {
  console.log("user connected");

  // socket.on("join", (data) => {
  //   socket.join(data.roomId);
  // });

  socket.on("new-message", async (data) => {
    // check if Chat room exists for both sender and receiver
    const { sender, receiver, message, imgPath, videoPath, audioPath } = data;
    const roomId = data.roomId.roomId;
    console.log("received data for emitting is", data);
    const commonData = {
      senderId: sender._id,
      receiverId: receiver._id,
      roomId,
    };

    // send message to a specific room roomId
    if (imgPath) {
      io.in(roomId).emit("new-message", {
        imgPath,
        type: "image",
        ...commonData,
        roomId,
      });
      return;
    } else if (videoPath) {
      io.in(roomId).emit("new-message", {
        videoPath,
        type: "video",
        ...commonData,
      });
      return;
    } else if (audioPath) {
      io.in(roomId).emit("new-message", {
        audioPath,
        type: "audio",
        ...commonData,
      });
      return;
    } else if (message) {
      io.in(roomId).emit("new-message", {
        body: message,
        ...commonData,
        type: "text",
      });

      // save message to database for future use
      const newMessage = Message({
        ...commonData,
        body: message,
      });
      await newMessage.save();
    }
  });

  // uncomment it to log all event received by socket-io in terminal console.
  // socket.onAny((event, ...args) => {
  //   console.log(event, args);
  // });
});

server.listen(PORT, () => {
  console.log(`started on port: ${PORT}`);
});
