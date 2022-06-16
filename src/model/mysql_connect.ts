import config from "../config/db_config";
const mysql = require('mysql');
import {MysqlError, PoolConnection} from "mysql";

//测试第一次连接mysql
const test = mysql.createConnection(config.mysql_option);
test.connect(function(err:MysqlError) {
    if (err) {
        console.error('mysql连接失败: ' + err.stack);
        return;
    }
    console.log('mysql连接成功');
});
test.end()


//创建mysql连接池
const pool = mysql.createPool(config.mysql_option);

//封装数据库查询操作
export const mdb={
    query(...sql:string[]){
        return new Promise((resolve,reject)=>{
            //从连接池里面获取一个连接
            pool.getConnection(function(err:MysqlError, connection:PoolConnection) {
                if(err){
                    reject(err)
                    return
                }
                // @ts-ignore
                connection.query(...sql, function (error:MysqlError|null, results:any) {
                    connection.release();
                    error?reject(error):resolve(results)
                });
            });
        })
    }
}

//创建user表
const createUser:string=`
create table user(
id int primary key auto_increment,
username varchar(20), 
email varchar(20),
password varchar(20),
createdAt DATETIME,
updatedAt DATETIME
)`
pool.getConnection(function(err:MysqlError, connection:PoolConnection) {
    if(err){
        console.log(err)
        return
    }
    connection.query(createUser, function (error:MysqlError|null, results:any) {
        connection.release();
    });
});

//创建article表
const createArticle:string=`
create table article(
id int primary key auto_increment,
owner varchar(20), 
title varchar(50),
body varchar(5000),
state varchar(10),
createdAt DATETIME,
updatedAt DATETIME
)`
pool.getConnection(function(err:MysqlError, connection:PoolConnection) {
    if(err){
        console.log(err)
        return
    }
    connection.query(createArticle, function (error:MysqlError|null, results:any) {
        connection.release();
    });
});

//创建用户头像表
const createAvatar:string=`
create table avatar(
id int primary key auto_increment,
owner varchar(20), 
body varchar(5000),
createdAt DATETIME,
updatedAt DATETIME
)`
pool.getConnection(function(err:MysqlError, connection:PoolConnection) {
    if(err){
        console.log(err)
        return
    }
    connection.query(createAvatar, function (error:MysqlError|null, results:any) {
        connection.release();
    });
});

//创建画板图片表
const createCanvas:string=`
create table canvas(
id int primary key auto_increment,
owner varchar(20), 
body varchar(5000),
createdAt DATETIME,
updatedAt DATETIME
)`
pool.getConnection(function(err:MysqlError, connection:PoolConnection) {
    if(err){
        console.log(err)
        return
    }
    connection.query(createCanvas, function (error:MysqlError|null, results:any) {
        connection.release();
    });
});
