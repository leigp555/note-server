import {Request, Response} from "express";
import {rdb} from "../model/redis_connect";
import {mdb} from "../model/mysql_connect";
import {jwtSecret}from "../config/jwt"
import {sign} from "../util/jwt";
const express = require("express");
const router = express.Router();

//统一路由处理
router.post('/', async (req:Request, res:Response) => {
    await rdb.setex('user',50,{name:"lgp",age:18});
    await rdb.setex('pet',50,{color:'black',gender:'male'});
    const value = await rdb.mget('user','pet');
    res.json({name:value})
});
router.get('/user', async (req:Request, res:Response) => {
    const value=await rdb.mget('user','pet');
    const ret= await mdb.query('SELECT * from tom where name=?','lgp')
    const user= await mdb.query('SELECT * from tom ')
    res.json({getRedis:value,mysqlRet:ret,user})
});
router.get('/login',async (req:Request, res:Response) => {
    const token=await sign({ foo: 'bar' }, jwtSecret, { expiresIn: '1h' });
    res.send({msg:token})
});

export default router
