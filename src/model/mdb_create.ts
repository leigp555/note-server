const { Sequelize, DataTypes, Model } = require("sequelize");
import config from "../config/db_config";

const fs = require("fs");

const defaultAvatar = fs.readFileSync("src/assert/e.jpg");
//配置连接
const { port, host, password, database, username } = config.mysql_config;
const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: "mysql",
  port,
  pool: {
    max: 50,
    min: 5,
    idle: 10,
  },
});

//创建user模型
export class Users extends Model {}

Users.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      comment: "用户序号",
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      default: "匿名",
      unique: true,
      comment: "用户名",
    },
    email: {
      type: DataTypes.STRING(20),
      allowNull: false,
      default: "907090585@qq.com",
      unique: true,
      comment: "邮箱",
    },
    password: {
      type: DataTypes.STRING(20),
      allowNull: false,
      default: "123456",
      comment: "密码",
    },
    createdAt: {
      type: DataTypes.DATE, //DATE类型自动添加updateAt和createdAt字段
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE, //DATE类型自动添加updateAt和createdAt字段
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Users",
    tableName: "users",
  }
);

//创建article模型
export class Articles extends Model {}

Articles.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "文章序号",
    },
    owner: {
      type: DataTypes.STRING(20),
      allowNull: false,
      default: "匿名",
      comment: "拥有者",
    },
    title: {
      type: DataTypes.STRING(110),
      allowNull: false,
      default: "匿名",
      comment: "文章标题",
    },
    body: {
      type: DataTypes.STRING(5000),
      allowNull: false,
      default: "匿名",
      comment: "文章主体",
    },
    state: {
      type: DataTypes.STRING(10),
      allowNull: false,
      default: "normal",
      comment: "文章状态",
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      default: false,
      allowNull: false,
      comment: "是否公开",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Articles",
    tableName: "articles",
  }
);

//创建头像模型
export class Avatars extends Model {}

Avatars.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "头像序号",
    },
    owner: {
      type: DataTypes.STRING(20),
      allowNull: false,
      default: "匿名",
      comment: "拥有者",
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
      default: "匿名",
      comment: "图片内容",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Avatars",
    tableName: "avatars",
  }
);

//创建canvas模型
export class CanvasImages extends Model {}

CanvasImages.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "图片序号",
    },
    owner: {
      type: DataTypes.STRING(20),
      allowNull: false,
      default: "匿名",
      comment: "拥有者",
    },
    path: {
      type: DataTypes.STRING(2000),
      allowNull: false,
      default: "匿名",
      comment: "图片内容",
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false,
      comment: "是否公开",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "CanvasImages",
    tableName: "CanvasImages",
  }
);

//测试连接并关闭连接
(async function () {
  try {
    await sequelize.authenticate();
    console.log("mysql连接成功");
    //同步数据库创建表
    await sequelize.sync();
    console.log("所有模型均已成功同步.");
  } catch (error) {
    console.error("mysql连接失败", error);
    sequelize.close().then();
  }
})();
