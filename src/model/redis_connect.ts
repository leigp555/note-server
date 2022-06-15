const Redis = require("ioredis");

//连接redis
export const rdb = new Redis({
    port: 6379,
    host: 'localhost',
    password: '123456',
    connectTimeout: 100,
    maxRetriesPerRequest: 2,
    retryStrategy: function (times:number) {
        return Math.min(times * 10, 3000);
    },
    reconnectOnError: function (err:Error) {
        let targetError = "READONLY";
        console.error('err:%j', err);
        if (err.message.slice(0, targetError.length) === targetError) {
            return true;
        }
    }
});
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

