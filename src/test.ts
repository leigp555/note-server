//
// import express = require('express');
// import {Request, Response} from "express";
// import {createClient} from 'redis';
// // @ts-ignore
// import {FieldInfo, MysqlError} from "mysql";
// const mysql = require('mysql');
// const app: express.Application = express();
//
// //连接redis
// const rdb = createClient({ url: 'redis://:123456abc@121.40.211.164:6379/0'});
// rdb.on('error', (err) => console.log('redis客户端连接失败', err));
// (async function () {
//     await rdb.connect();
// })().then(()=>{
//     console.log("redis连接成功")
// }).catch(err => console.log('redis连接失败',err));
//
//
// //连接mysql
// const mysql_config={
//     host: 'localhost',
//     user: 'root',
//     password: '123456',
//     database: 'user',
// }
// let mdb = mysql.createConnection(mysql_config);
// //第一次连接数据库用于测试
// mdb.connect(function(err:MysqlError) {
//     if (err) {
//         console.error('mysql连接失败: ' + err.stack);
//         return;
//     }
//     console.log('mysql连接成功');
// });
// mdb.end()
//
// //mysql操作的封装
// const sqldb={
//     query:(sql:string)=>{
//         return new Promise((resolve,reject)=>{
//             //连接数据库
//             mdb = mysql.createConnection(mysql_config);
//             mdb.connect(function(err:MysqlError) {
//                 if (err) {
//                     reject('mysql连接失败: ' + err.stack);
//                 }else {
//                     //sql语句查询数据库
//                     mdb.query(sql, function (error:MysqlError, results:any) {
//                         error?reject(error): resolve(results)
//                         mdb.end()
//                     });
//                 }
//             });
//         })
//     }
// }
//
//
// app.get('/', async (req:Request, res:Response) => {
//     await rdb.setEx('name', 30,'lgp');
//     const value = await rdb.get('name');
//     res.json({name:value})
// });
//
//
// app.get('/user', async (req:Request, res:Response) => {
//     const value=await rdb.get('name');
//     const ret= await sqldb.query("SELECT name,password from tom where name='lgp'")
//     res.json({getRedis:value,mysqlRet:ret})
// });
//
//
//
// app.listen(3000, ()=> {
//     console.log('成功监听8000端口');
// });
//
