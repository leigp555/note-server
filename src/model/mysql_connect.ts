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
const createUser:string=`create table user(
id int primary key auto_increment,
username varchar(9),
password varchar(10),
createAt date,
updateAt date
)`
pool.getConnection(function(err:MysqlError, connection:PoolConnection) {
    if(err){
        console.log(err)
        return
    }
    connection.query(createUser, function (error:MysqlError|null, results:any) {
        connection.release();
        error?console.log('创建user表失败'):console.log("成功创建user表")
    });
});

//创建article表
const createArticle:string=`
create table article(
id int primary key auto_increment,
username varchar(9), 
password varchar(10),
createAt date,
updateAt date
)`
pool.getConnection(function(err:MysqlError, connection:PoolConnection) {
    if(err){
        console.log(err)
        return
    }
    connection.query(createArticle, function (error:MysqlError|null, results:any) {
        connection.release();
        error?console.log('创建article表失败'):console.log("成功创建article表")
    });
});
