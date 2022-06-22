const express = require("express");
import { NextFunction, Request, Response } from "express";
import { rdb } from "../model/redis_connect";
import { sign } from "../util/jwt";
import { jwtSecret } from "../config/jwt_config";
import { email } from "../util/send_email";
import { Register } from "../common/type";
import { Articles, Avatars, CanvasImages, Users } from "../model/mdb_create";
const { Op } = require("sequelize");

const router = express.Router();

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
      await email(user_email, security_code);
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
      });
      if (is_username_save[0]) {
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
      });
      if (is_email_save[0]) {
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
        });
        if (user[0]) {
          const token = await sign({ user: username }, jwtSecret, {
            expiresIn: "2h",
          });
          res.status(200).json({ user: username, token });
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
        });
        if (user[0]) {
          const token = await sign({ user: username }, jwtSecret, {
            expiresIn: "2h",
          });
          res.status(200).json({ user: username, token });
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
  "/test/redis",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //解析token获取用户信息
      //获取头像路径
      // const avatarPath = await Avatars.findAll({
      //   attributes: ["path"],
      //   where: {
      //     owner: {
      //       [Op.eq]: req.username,
      //     },
      //   },
      // });
    } catch (error) {
      next(error);
    }
  }
);

//创建新文章
//删除文章
//修改文章
//查询文章
//图片存储
//获取图片
export default router;
