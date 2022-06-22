const express = require("express");
const { promisify } = require("util");
const fs = require("fs");
import e, { NextFunction, Request, Response } from "express";
import { rdb } from "../model/redis_connect";
import { sign } from "../util/jwt";
import { jwtSecret } from "../config/jwt_config";
import { send_email } from "../util/send_email";
import { Register } from "../common/type";
import { Articles, Avatars, CanvasImages, Users } from "../model/mdb_create";
const { Op } = require("sequelize");
import { verifyToken } from "../middleware/verify_token";
const router = express.Router();

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

//测试
router.get("/test/redis", async (req: Request, res: Response) => {
  await rdb.setex("user", 50, "lgp");
  await rdb.setex("pet", 50, "cat");
  const value = await rdb.mget("user", "pet");
  res.json({ name: value });
});
router.get(
  "/test/mysql",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //创建一条数据
      const security_code = Math.round(Math.random() * Math.pow(10, 6));
      const userItem = await Users.create({
        username: "admin",
        email: "907090585@qq.com",
        password: "123456",
      });
      res.json({ userItem });
    } catch (err) {
      next(err);
    }
  }
);

//发送验证码
router.post(
  "/securityCode",
  async (req: Request, res: Response, next: NextFunction) => {
    const user_email: string = req.body.email;
    try {
      const security_code = Math.round(
        Math.random() * Math.pow(10, 6)
      ).toString();
      await send_email(user_email, security_code);
      await rdb.setex(`${user_email}:${security_code}`, 180, security_code);
      res.send({ msg: "验证码已发送" });
    } catch (err: any) {
      next(err);
    }
  }
);

//注册
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, securityCode } = req.body as Register;
    try {
      //判断验证码是否正确
      const redis_code = await rdb.get(`${email}:${securityCode}`);
      if (!redis_code) {
        res.status(400).json({
          errors: { errMsg: "验证码错误", security_code: redis_code },
        });
        return;
      }
      //判断用户名是否存在
      const is_username_save = await Users.findAll({
        attributes: ["username"],
        where: {
          username: {
            [Op.eq]: username,
          },
        },
      })[0];
      if (is_username_save) {
        res.status(400).json({
          errors: { errMsg: "用户名已存在", username: is_username_save },
        });
        return;
      }
      //判断邮箱是否存在
      const is_email_save = await Users.findAll({
        attributes: ["email"],
        where: {
          email: {
            [Op.eq]: email,
          },
        },
      })[0];
      if (is_email_save) {
        res.status(400).json({
          errors: { errMsg: "邮箱已存在", email: is_email_save },
        });
        return;
      }
      await Users.create({ username, email, password });
      res.status(200).json({ msg: "注册成功", user: { username, email } });
    } catch (err) {
      next(err);
    }
  }
);
//登录
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    const reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    try {
      //邮箱登录
      if (reg.test(username)) {
        const user = await Users.findAll({
          attributes: ["username", "email"],
          where: {
            [Op.and]: [{ email: username }, { password }],
          },
        })[0];
        if (user) {
          const token = await sign({ user: username.email }, jwtSecret, {
            expiresIn: "2h",
          });
          res.status(200).json({ user: username, token: "Bearer" + token });
        } else {
          res.status(400).json({ errMsg: "用户名或密码不正确" });
        }
        return;
      } else {
        //用户名登陆
        const user = await Users.findAll({
          attributes: ["username", "email"],
          where: {
            [Op.and]: [{ username }, { password }],
          },
        })[0];
        if (user) {
          const token = await sign({ user: user.email }, jwtSecret, {
            expiresIn: "2h",
          });
          res.status(200).json({ user: username, token: "Bearer" + token });
        } else {
          res.status(400).json({ errMsg: "用户名或密码不正确" });
        }
      }
    } catch (err) {
      next(err);
    }
  }
);

//获取头像
router.get(
  "/avatar",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    try {
      // 获取头像路径
      const avatarPath = await Avatars.findAll({
        attributes: ["path"],
        where: {
          owner: {
            [Op.eq]: req.userEmail,
          },
        },
      })[0];
      if (avatarPath) {
        //头像存在
        const avatar_file = await readFile(avatarPath);
        res.status(200).send(avatar_file);
      } else {
        //头像不存在，创建头像
        const rand_code = Math.round(Math.random() * Math.pow(10, 6));
        const default_avatar = await readFile("../assert/avatar/default.jpg");
        const newAvatarPath = `../assert/avatar/${
          req.userEmail + rand_code
        }.jpg`;
        await writeFile(newAvatarPath, default_avatar);
        await Avatars.create({ owner: req.userEmail, path: newAvatarPath });
        res.status(200).send(default_avatar);
      }
    } catch (error) {
      next(error);
    }
  }
);

//更换头像
router.post(
  "/update/avatar",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const avatar_file = req.body.avatar;
    try {
      // 获取头像路径
      const avatarPath = await Avatars.findAll({
        attributes: ["path"],
        where: {
          owner: {
            [Op.eq]: req.userEmail,
          },
        },
      })[0];
      if (avatarPath) {
        //头像存在，替换头像
        await writeFile(avatarPath, avatar_file);
      } else {
        res.status(500).json({ errMsg: "头像更新失败" });
      }
    } catch (error) {
      next(error);
    }
  }
);
//创建新文章
router.post(
  "/article",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const { owner, title, body, isPublic, state } = req.body;
    try {
      //向数据库插入数据
      Articles.create({ owner, title, body, isPublic, state });
      //返回新创建的文章
      res
        .status(200)
        .json({ article: { owner, title, body, isPublic, state } });
    } catch (error) {
      next(error);
    }
  }
);
//删除文章
//修改文章
//查询文章
//图片存储
//获取图片
export default router;
