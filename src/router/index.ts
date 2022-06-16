import {createDate} from "../model/createDate";

const express = require("express");
import {NextFunction, Request, Response} from "express";
import {rdb} from "../model/redis_connect";
import {mdb} from "../model/mysql_connect";
import {sign} from "../util/jwt";
import {jwtSecret} from "../config/jwt_config";
import {email} from "../util/send_email"
import {Register} from "../common/type";

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
        const ret= await mdb.query('SELECT * from user where name=?','lgp')
        const user= await mdb.query('SELECT * from user')
        res.json({user})
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
