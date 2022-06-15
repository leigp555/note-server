const mysql = require('mysql');
// @ts-ignore
import {FieldInfo, MysqlError, PoolConnection} from "mysql";

//创建mysql连接池
const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'user',
});
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
                //使用连接获取查询结果
                // @ts-ignore
                connection.query(...sql, function (error:MysqlError|null, results:any) {
                    connection.release();
                    error?reject(error):resolve(results)
                });
            });
        })
    }
}


