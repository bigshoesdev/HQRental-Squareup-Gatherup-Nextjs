import jwt from "jsonwebtoken";
import User from "../models/User";
import { JWT_SECRET } from "./constant";

export async function verifyToken(req) {
  const authorizationHeader =
    req.headers?.Authorization ||
    req.headers?.authorization ||
    req.body?.headers?.Authorization ||
    req.body?.headers?.authorization;

  if (!authorizationHeader) {
    throw "No authorization token";
  }

  const { userId, iat } = jwt.verify(authorizationHeader, JWT_SECRET);

  const user = await User.findById(userId);

  const isAdmin =
    user.roles.includes("admin") || user.roles.includes("super-admin");

  // Within 1 offset Range
  if (user && iat >= Math.floor(user.lastLoggedIn / 1000) - 1) {
    return user;
  } else if (isAdmin) {
    return user;
  } else {
    throw "Session is expired";
  }
}
