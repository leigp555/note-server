import { verify } from "../util/jwt";
import { NextFunction, Request, Response } from "express";
const { jwtSecret } = require("../config/jwt_config");

export const verifyToken = async (
  req: Request & { userEmail: string },
  res: Response,
  next: NextFunction
) => {
  let token = req.headers.authorization;
  token = token ? token.split("Bearer:")[1] : undefined;
  if (!token) {
    res.status(401).json({ errMsg: "操作失败，请先申情权限" });
    return;
  }
  try {
    const decodeToken = await verify(token, jwtSecret);
    req.userEmail = decodeToken.user;
    next();
  } catch (err) {
    res.status(401).json({ errMsg: "操作失败，请先申情权限" });
  }
};
