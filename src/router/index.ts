import {createDate} from "../model/createDate";

const express = require("express");
import {NextFunction, Request, Response} from "express";
import {rdb} from "../model/redis_connect";
import {sign} from "../util/jwt";
import {jwtSecret} from "../config/jwt_config";
import {email} from "../util/send_email"
import {Register} from "../common/type";
import {Articles, Avatars, CanvasImages, Users} from "../model/mdb_create";

const router = express.Router();

//测试
router.get('/test/redis', async (req:Request, res:Response) => {
    await rdb.setex('user',50,"lgp");
    await rdb.setex('pet',50,"cat");
    const value = await rdb.mget('user','pet');
    res.json({name:value})
});
router.get('/test/mysql', async (req:Request, res:Response,next:NextFunction) => {
    try{
        //创建一条数据
        const user = createDate.user("admin", '122974945@qq.com', '123456');
        const userItem = await Users.create(user)
        const article = createDate.article("admin", '天气', '天气不错',"normal",false);
        const articleItem = await Articles.create(article)
        const avatar = createDate.avatar("admin", '头像');
        const avatarItem = await Avatars.create(avatar)
        const canvasImg = createDate.canvasImg("admin", 'canvas',true);
        const canvasItem = await CanvasImages.create(canvasImg)
        res.json({userItem,articleItem,avatarItem,canvasItem})
    }catch (err) {
        next(err)
    }
});

//发送验证码
router.post('/securityCode',async (req:Request, res:Response,next:NextFunction) => {
    const user_email:string=req.body.email
    try{
        const security_code=Math.round(Math.random()*Math.pow(10, 6))
        await email(user_email, security_code)
        await rdb.setex(user_email+security_code.toString(),180,security_code)
        res.send({msg:"验证码已发送"})
    }catch (err:any) {
        next(err)
    }
});


//注册
router.post('/register',async (req:Request, res:Response,next:NextFunction) => {
    const {username, email, password, securityCode}=req.body as Register
    const redis_code=await rdb.get(email+securityCode.toString())
    if(!redis_code){
        res.status(400).json({
            "errors":{errMsg:"验证码错误"}
        })
        return
    }
    try{
        const newUser= createDate.user(username,email,password)
        console.log(`insert into user(${Object.keys(newUser).join()}) values (${Object.values(newUser).join()})`)
        //await mdb.query(`insert into user values (Username username,Email 122974945@qq.com,Password 123456)`)
        res.json({msg:'注册成功'})
    }catch (err) {
        next(err)
    }
});
//登录
router.post('/login',async (req:Request, res:Response) => {
    const token=await sign({ foo: 'bar' }, jwtSecret, { expiresIn: '1h' });
    res.send({token})
});

export default router
