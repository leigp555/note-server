import {createDate} from "./createDate";

const {Sequelize, DataTypes, Model} = require('sequelize');
import config from "../config/db_config"

const fs = require('fs')

const defaultAvatar = fs.readFileSync('src/assert/e.jpg')
//配置连接
const {port, host, password, database, username} = config.mysql_config
const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: 'mysql',
    port,
    pool: {
        max: 50,
        min: 0,
        idle: 30000
    }
});


//创建user模型
export class Users extends Model {
}

Users.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,     //DATE类型自动添加updateAt和createdAt字段
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,     //DATE类型自动添加updateAt和createdAt字段
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Users',
    tableName: 'users'
});


//创建article模型
export class Articles extends Model {
}

Articles.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    owner: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(110),
        allowNull: false
    },
    body: {
        type: DataTypes.STRING(5000),
        allowNull: false
    },
    state: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Articles',
    tableName: 'articles'
});

//创建头像模型
export class Avatars extends Model {
}

Avatars.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    owner: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Avatars',
    tableName: 'avatars'
});

//创建canvas模型
export class CanvasImages extends Model {
}

CanvasImages.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    owner: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    body: {
        type: DataTypes.STRING(2000),
        allowNull: false
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'CanvasImages',
    tableName: 'CanvasImages'
});


//测试连接并关闭连接
(async function () {
    try {
        await sequelize.authenticate();
        console.log('mysql连接成功');
        //同步数据库创建表
        // Users.hasOne(Articles, {
        //     onDelete: 'RESTRICT',
        //     onUpdate: 'RESTRICT'
        // });
        await sequelize.sync();
        console.log("所有模型均已成功同步.");
    } catch (error) {
        console.error('mysql连接失败', error);
        sequelize.close().then()
    }
})()
