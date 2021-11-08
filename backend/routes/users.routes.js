import bcrypt from "bcryptjs";
import config from "config";
import express from "express";
import jwt from "jsonwebtoken";
import _ from "lodash";
import authMiddleware from "../middleware/auth.middleware.js";
import User, { validate } from "../models/user.model.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send("User is already registered");
  }

  user = new User(_.pick(req.body, ["username", "password", "email"]));
  const salt = await bcrypt.genSalt();
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  const token = jwt.sign(
    { _id: user._id, username: user.username, email: user.email },
    config.get("privateKey")
  );
  res
    .setHeader("x-auth-token", token)
    .status(201)
    .send(_.pick(user, ["_id", "username", "email"]));
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.get("/all", authMiddleware, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password, -__v"
  );

  res.send(users);
});

router.get("/:id", async (req, res) => {
  let user = await User.findById(req.params.id);
  user = _.pick(user, ["_id", "username", "email"]);
  res.send(user);
});
// module.exports = router;
export default router;
