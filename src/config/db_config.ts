const mysql_option={
    port: 3306,
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'note',

}
const redis_option={
    port: 6379,
    host: '121.40.211.164',
    password: '123456abc',
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
}
export default {mysql_option,redis_option}
