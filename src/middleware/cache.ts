import {NextFunction, Request, Response} from "express";

//设置http缓存时间
export const cache=function (req:Request,res:Response,next:NextFunction){
    res.setHeader('Cache-Control', 'max-age=31536000');
    next()
}

