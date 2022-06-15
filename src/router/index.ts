import {NextFunction, Request, Response} from "express";
import {rdb} from "../model/redis_connect";
import {mdb} from "../model/mysql_connect";

import {sign} from "../util/jwt";
import {jwtSecret} from "../config/jwt_config";
const express = require("express");
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
        const ret= await mdb.query('SELECT * from tom where name=?','lgp')
        const user= await mdb.query('SELECT * from tom ')
        res.json({mysqlRet:ret,user})
    }catch (err) {
        next(err)
    }
});


//注册
router.get('/register',async (req:Request, res:Response) => {
    const token=await sign({ foo: 'bar' }, jwtSecret, { expiresIn: '1h' });
    res.send({msg:token})
});
//登录
router.get('/login',async (req:Request, res:Response) => {
    const token=await sign({ foo: 'bar' }, jwtSecret, { expiresIn: '1h' });
    res.send({msg:token})
});

export default router
