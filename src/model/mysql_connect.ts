import config from "../config/db_config";

const mysql = require('mysql');
import {MysqlError, PoolConnection} from "mysql";

//测试第一次连接mysql
const test = mysql.createConnection(config.mysql_option);
test.connect(function (err: MysqlError) {
    if (err) {
        console.error('mysql连接失败: ' + err.stack);
        return;
    }
    console.log('mysql连接成功');
});
test.end()


//创建mysql连接池
const pool = mysql.createPool(config.mysql_option);


//note数据库sql
const notesql='CREATE DATABASE IF NOT EXISTS note CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci'
//user表sql
const createUser: string = `
CREATE TABLE IF NOT EXISTS user(
id int primary key auto_increment,
username varchar(20), 
email varchar(20),
password varchar(20),
createdAt DATETIME,
updatedAt DATETIME
)`
//article表sql
const createArticle: string = `
CREATE TABLE IF NOT EXISTS article(
id int primary key auto_increment,
owner varchar(20), 
title varchar(50),
body varchar(5000),
state varchar(10),
isPublic varchar(10),
createdAt DATETIME,
updatedAt DATETIME
)`
//头像表sql
const createAvatar: string = `
CREATE TABLE IF NOT EXISTS avatar(
id int primary key auto_increment,
owner varchar(20), 
body varchar(5000),
createdAt DATETIME,
updatedAt DATETIME
)`
//canvas图片表sql
const createCanvas: string = `
CREATE TABLE IF NOT EXISTS canvas(
id int primary key auto_increment,
owner varchar(20), 
body varchar(5000),
isPublic varchar(10),
createdAt DATETIME,
updatedAt DATETIME
)`

//创建表工厂函数
const createTable = (sql: string) => {
    pool.getConnection(function (err: MysqlError, connection: PoolConnection) {
        if (err) {
            console.log(err)
            return
        }
        connection.query('use note;')
        connection.query(sql, function (error: MysqlError | null, results: any) {
            connection.release();
        });
    });
}

//创建数据库和表
pool.getConnection(function (err: MysqlError, connection: PoolConnection) {
    if (err) {
        console.log(err)
        return
    }
    connection.query(notesql, function (error: MysqlError, results: string) {
        connection.query('use note;')
        connection.release();
        if (error) {
            throw error;
        }
        //创建user表
        createTable(createUser)
        //创建article表
        createTable(createArticle)
        //创建用户头像表
        createTable(createAvatar)
        //创建画板图片表
        createTable(createCanvas)

    });
});


//封装数据库查询操作
export const mdb = {
    query: function (...sql: string[]) {
        return new Promise((resolve, reject) => {
            //从连接池里面获取一个连接
            pool.getConnection(function (err: MysqlError, connection: PoolConnection) {
                if (err) {
                    reject(err)
                    return
                }
                connection.query('use note;')
                // @ts-ignore
                connection.query(...sql, function (error: MysqlError | null, results: any) {
                    connection.release();
                    error ? reject(error) : resolve(results)
                });
            });
        })
    }
}

