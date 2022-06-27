const { Sequelize, DataTypes, Model } = require("sequelize");
import config from "../config/db_config";

const fs = require("fs");

//配置连接
const { port, host, password, database, username } = config.mysql_config;
const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: "mysql",
  logging: console.log,
  port,
  pool: {
    max: 50,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
});

export const db = { sequelize: sequelize };
db.sequelize = sequelize;

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
      defaultValue: "匿名",
      unique: true,
      validate: {
        is: /^[0-9A-Za-z_@/.]{3,20}$/,
      },
      comment: "用户名",
    },
    email: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "907090585@qq.com",
      unique: true,
      isEmail: true,
      comment: "邮箱",
    },
    password: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "123456",
      comment: "密码",
      validate: {
        is: /^[a-zA-Z0-9_-]{6,16}$/,
      },
    },
    createdAt: {
      type: DataTypes.DATE, //DATE类型自动添加updateAt和createdAt字段
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE, //DATE类型自动添加updateAt和createdAt字段
      defaultValue: DataTypes.NOW,
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
      defaultValue: "匿名",
      comment: "拥有者",
    },
    title: {
      type: DataTypes.STRING(110),
      allowNull: true,
      defaultValue: "标题",
      comment: "文章标题",
    },
    body: {
      type: DataTypes.STRING(5000),
      allowNull: true,
      defaultValue: "正文",
      comment: "文章主体",
    },
    state: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "normal",
      comment: "文章状态",
    },
    identity_number: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValueValue: DataTypes.UUIDV4,
      comment: "文章id",
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "是否公开",
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "是否删除",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
      defaultValue: "匿名",
      comment: "拥有者",
      unique: true,
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "../assert/avatar/default.jpg",
      comment: "图片内容",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
      defaultValue: "匿名",
      comment: "拥有者",
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "图片内容",
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "是否删除",
    },
    identity_number: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValueValue: DataTypes.UUIDV4,
      comment: "图片id",
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "是否公开",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
