//初始化mysql并添加数据库
// const mysql_config = {
//   port: 4000,
//   host: "121.40.211.164",
//   password: "123456abc",
//   database: "note",
//   username: "root",
// };
const mysql_config = {
  port: 3306,
  host: "localhost",
  password: "123456",
  database: "note",
  username: "root",
};
//redis配置
const redis_option = {
  port: 5000,
  host: "121.40.211.164",
  password: "123456abc",
  connectTimeout: 100,
  maxRetriesPerRequest: 2,
  retryStrategy: function (times: number) {
    return Math.min(times * 10, 3000);
  },
  reconnectOnError: function (err: Error) {
    let targetError = "READONLY";
    console.error("err:%j", err);
    if (err.message.slice(0, targetError.length) === targetError) {
      return true;
    }
  },
};
export default { mysql_config, redis_option };
