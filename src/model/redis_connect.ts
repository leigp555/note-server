import config from "../config/db_config";

const Redis = require("ioredis");

//连接redis
export const rdb = new Redis(config.redis_option);
rdb.on('connect',(err:Error) => {
    if (err) {
        console.error('redis连接失败');
    } else {
        console.log('redis连接成功');
    }
});
rdb.on('error', (err:Error) => {
    if (err) {
        console.error('redis连接错误');
    } else {
        console.log('redis连接错误');
    }
});

