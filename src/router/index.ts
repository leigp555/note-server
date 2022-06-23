const express = require("express");
const { promisify } = require("util");
const { QueryTypes } = require("sequelize");
const fs = require("fs");
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../model/mdb_create";
import { rdb } from "../model/redis_connect";
import { sign } from "../util/jwt";
import { jwtSecret } from "../config/jwt_config";
import { send_email } from "../util/send_email";
import { Register } from "../common/type";
import { Articles, Avatars, CanvasImages, Users } from "../model/mdb_create";
const { Op } = require("sequelize");
import { verifyToken } from "../middleware/verify_token";
import { translate } from "../util/translate";
const router = express.Router();

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

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
      let sql = `select username from users where users.username= ?`;
      const is_username_save = await db.sequelize.query(sql, {
        replacements: [username],
        type: QueryTypes.SELECT,
      });
      if (is_username_save[0]) {
        res.status(400).json({
          errors: { errMsg: "用户名已存在", username: is_username_save },
        });
        return;
      }
      //判断邮箱是否存在
      sql = `select email from users where users.email= ?`;
      const is_email_save = await db.sequelize.query(sql, {
        replacements: [email],
        type: QueryTypes.SELECT,
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
        let sql = `select username,email from users where (users.email= ? and users.password= ?)`;
        const user = await db.sequelize.query(sql, {
          replacements: [username, password],
          type: QueryTypes.SELECT,
        });
        const ret = user[0];
        if (ret) {
          const token = await sign({ user: ret.email }, jwtSecret, {
            expiresIn: "2h",
          });
          res
            .status(200)
            .json({ user: user[0].username, token: "Bearer:" + token });
        } else {
          res.status(400).json({ errMsg: "用户名或密码不正确" });
        }
      } else {
        //用户名登陆
        let sql =
          "select username,email from users where (users.username= ? and users.password= ?)";
        const user = await db.sequelize.query(sql, {
          replacements: [username, password],
          type: QueryTypes.SELECT,
        });
        const ret = user[0];
        if (ret) {
          const token = await sign({ user: ret.email }, jwtSecret, {
            expiresIn: "2h",
          });
          res.status(200).json({ user: username, token: "Bearer:" + token });
        } else {
          res.status(400).json({ errMsg: "用户名或密码不正确" });
        }
      }
    } catch (err) {
      next(err);
    }
  }
);

//根据token获取用户信息
router.get(
  "/user/info",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    try {
      let sql = `select username,email from users where (users.email= ?)`;
      const user = await db.sequelize.query(sql, {
        replacements: [req.userEmail],
        type: QueryTypes.SELECT,
      });
      const ret = user[0];
      if (ret) {
        res.status(200).json(ret);
      } else {
        res.status(400).json({ errors: { errMsg: "请先登录或注册" } });
      }
    } catch (error) {
      next(error);
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
      let sql = "select path from avatars where (avatars.owner= ?)";
      const avatarPath = await db.sequelize.query(sql, {
        replacements: [req.userEmail],
        type: QueryTypes.SELECT,
      });
      const ret = avatarPath[0].path;
      if (ret) {
        //头像存在
        const avatar_file = await readFile(ret);
        res.status(200).json({ avatar: avatar_file });
      } else {
        //头像不存在，创建头像
        const rand_code = Math.round(Math.random() * Math.pow(10, 6));
        const default_avatar = await readFile("../assert/avatar/default.jpg");
        const newAvatarPath = `../assert/avatar/${
          req.userEmail + rand_code
        }.jpg`;
        await writeFile(newAvatarPath, default_avatar);
        await Avatars.create({ owner: req.userEmail, path: newAvatarPath });
        res.status(200).json({ avatar: default_avatar });
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
      let sql = "select path from avatars where (avatars.owner= ?)";
      const avatarPath = await db.sequelize.query(sql, {
        replacements: [req.userEmail],
        type: QueryTypes.SELECT,
      });
      const ret = avatarPath[0].path;
      if (ret && ret != "../assert/avatar/default.jpg") {
        //头像存在，覆盖头像
        await writeFile(avatarPath, avatar_file);
        res.status(200).json({ msg: "更换成功" });
      } else {
        //头像不存在，创建头像，更新头像路径
        const rand_code = Math.round(Math.random() * Math.pow(10, 6));
        const newAvatarPath = `../assert/avatar/${
          req.userEmail + rand_code
        }.jpg`;
        await writeFile(newAvatarPath, avatar_file);
        await Avatars.update(
          { path: newAvatarPath },
          {
            where: {
              owner: req.userEmail,
            },
          }
        );
        res.status(200).json({ msg: "更换成功" });
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
    const { title, body, isPublic, state } = req.body;
    try {
      //向数据库中插入数据
      await Articles.create({
        owner: req.userEmail,
        title,
        body,
        isPublic,
        state,
      });
      //返回新创建的文章
      res.status(200).json({ article: { title, body, isPublic, state } });
    } catch (error) {
      next(error);
    }
  }
);

//删除文章
router.delete(
  "/article",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const { identity_number } = req.body;
    try {
      //在数据库中标记文章已删除
      await Articles.update(
        { deleted: true },
        {
          where: {
            [Op.and]: [{ identity_number }, { owner: req.userEmail }],
          },
        }
      );
      res.status(200).json({ msg: "操作成功" });
    } catch (error) {
      next(error);
    }
  }
);

//修改文章
router.patch(
  "/article",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const { identity_number, owner, ...rest } = req.body;
    try {
      //修改文章内容
      await Articles.update(rest, {
        where: {
          [Op.and]: [{ identity_number }, { owner: req.userEmail }],
        },
      });
      res.status(200).json({ msg: "修改成功" });
    } catch (error) {
      next(error);
    }
  }
);
//查询所有文章
router.get(
  "/article/all",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const { offset, limit } = req.query;
    try {
      //获取所有文章
      let sql = `select owner, title, body, state, isPublic, identity_number from articles where (articles.owner= ? and articles.deleted= ?) limit ${offset},${limit}`;
      const article_all = await db.sequelize.query(sql, {
        replacements: [req.userEmail, false],
        type: QueryTypes.SELECT,
      });
      res.status(200).json({ articles: article_all });
    } catch (error) {
      next(error);
    }
  }
);
//通过文章identity_number查询文章
router.get(
  "/article/identify",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    try {
      //获取文章
      const { identity_number } = req.query;
      let sql = `select owner, title, body, state, isPublic, identity_number from articles where (articles.owner= ? and articles.deleted= ? and articles.identity_number=?)`;
      const ret = await db.sequelize.query(sql, {
        replacements: [req.userEmail, false, identity_number],
        type: QueryTypes.SELECT,
      });
      ret[0]
        ? res.status(200).json({ articles: ret })
        : res.status(404).json({ errMsg: "内容不存在" });
    } catch (error) {
      next(error);
    }
  }
);

//获取收藏的文章
router.get(
  "/article/favorite",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const { offset, limit } = req.query;
    try {
      //获取所有收藏的文章
      let sql = `select owner, title, body, state, isPublic, identity_number from articles where (articles.owner= ? and articles.deleted= ?and articles.state= ?) limit ${offset},${limit}`;
      const favorite_article = await db.sequelize.query(sql, {
        replacements: [req.userEmail, false, "favorite"],
        type: QueryTypes.SELECT,
      });
      res.status(200).json({ articles: favorite_article });
    } catch (error) {
      next(error);
    }
  }
);
//获取已删除的文章
router.get(
  "/article/deleted",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const { offset, limit } = req.query;
    try {
      //获取所有收藏的文章
      let sql = `select owner, title, body, state, isPublic, identity_number from articles where (articles.owner= ? and articles.deleted= ?) limit ${offset},${limit}`;
      const deleted_article = await db.sequelize.query(sql, {
        replacements: [req.userEmail, true],
        type: QueryTypes.SELECT,
      });
      res.status(200).json({ articles: deleted_article });
    } catch (error) {
      next(error);
    }
  }
);

//搜索文章
router.get(
  "/article/search",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const { keyword, offset, limit } = req.query;
    try {
      //获取符合要求的文章
      let sql = `select owner, title, body, state, isPublic, identity_number from articles where (articles.owner= ? and articles.deleted= ? and articles.title like ?) limit ${offset},${limit}`;
      const deleted_article = await db.sequelize.query(sql, {
        replacements: [req.userEmail, false, keyword + "%"],
        type: QueryTypes.SELECT,
      });
      res.status(200).json({ articles: deleted_article });
    } catch (error) {
      next(error);
    }
  }
);
//图片存储
router.post(
  "/img/save",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const { content, isPublic } = req.body;
    try {
      const random_code = uuidv4();
      const newAvatarPath = `../assert/canvas/${random_code}.jpg`;
      await writeFile(newAvatarPath, content);
      await CanvasImages.create({
        owner: req.userEmail,
        path: newAvatarPath,
        isPublic,
        identity_number: random_code,
      });
      res.status(200).json({ imgId: random_code });
    } catch (error) {
      next(error);
    }
  }
);
//通过imgId获取单张图片
router.get(
  "/img/imgId",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const { imgId } = req.query;
    try {
      //获取符合要求的文章
      let sql = `select owner,identity_number,path from canvasImages  where (canvasImages.owner= ? and canvasImages.deleted= ? and canvasImages.identity_number= ?)`;
      const identity_image = await db.sequelize.query(sql, {
        replacements: [req.userEmail, false, imgId],
        type: QueryTypes.SELECT,
      });
      const ret = identity_image[0];
      if (ret) {
        const imgFile = await readFile(ret.path);
        res.status(200).json({ img: imgFile });
      } else {
        res.status(404).json({ errMsg: "内容不存在" });
      }
    } catch (error) {
      next(error);
    }
  }
);
//获取所有的图片
router.get(
  "/img/all",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    try {
      //获取所有图片信息
      const { offset, limit } = req.query;
      let sql = `select owner,identity_number,path from canvasImages  where (canvasImages.owner= ? and canvasImages.deleted= ?) limit ${offset},${limit}`;
      const all_image = await db.sequelize.query(sql, {
        replacements: [req.userEmail, false],
        type: QueryTypes.SELECT,
      });
      const ret = all_image[0];
      if (ret) {
        let images: string[] = [];
        type Image = { owner: string; identity_number: string; path: string };
        all_image.forEach(async (item: Image) => {
          const imgFile = await readFile(item.path);
          images.push(imgFile);
        });
        res.status(200).json({ images });
      } else {
        res.status(404).json({ errMsg: "内容不存在" });
      }
    } catch (error) {
      next(error);
    }
  }
);
//删除图片
router.delete(
  "/img/imgId",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const { imgId } = req.query;
    try {
      //标记已删除
      await CanvasImages.update(
        { deleted: true },
        {
          where: {
            [Op.and]: [{ identity_number: imgId }, { owner: req.userEmail }],
          },
        }
      );
      res.status(200).json({ msg: "删除成功" });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/translate",
  verifyToken,
  async (
    req: Request & { userEmail: string },
    res: Response,
    next: NextFunction
  ) => {
    const { word, from, to } = req.query as {
      word: string;
      from: string;
      to: string;
    };
    try {
      const result = await translate(word, from, to);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  }
);
export default router;
