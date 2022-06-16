import express = require('express');
const morgan = require("morgan");
const cors = require("cors");
const compression = require('compression');
const app: express.Application = express();
import {error_handle} from "./middleware/error_handle";
import router from "./router/index";
import {corsOptions} from "./config/cors_config";
import {Request, Response} from "express";

//express自带中间件的使用
app.use(morgan(':method  :status  :url   -:response-time ms  ')); //日志
app.use(express.urlencoded()); //解析请求体
app.use(express.json()); //解析请求体

//开启gzip
app.use(compression({ filter: shouldCompress }))
function shouldCompress (req:Request, res:Response) {
  if (req.headers['x-no-compression']) {
    return false
  }
  return compression.filter(req, res)
}

//统一处理options请求
app.options('*', cors(corsOptions))
//统一路由处理
app.use('/v1',cors(corsOptions),router)

//统一错误处理
app.use(error_handle())

app.listen(8000, ()=> {
  console.log('成功监听8000端口');
});

