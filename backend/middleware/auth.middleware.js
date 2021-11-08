import config from "config";
import jwt from "jsonwebtoken";

export default function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided");
  try {
    const payload = jwt.verify(token, config.get("privateKey"));
    req.user = payload;
    next();
  } catch (e) {
    res.status(400).send("invalid token");
  }
}
