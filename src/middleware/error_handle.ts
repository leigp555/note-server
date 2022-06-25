import {NextFunction, Request, Response} from "express";
const util=require('util')

export const error_handle=()=>{
    return (err:Error,req:Request,res:Response,next:NextFunction)=>{
        console.log(err)
        res.status(500).json({
            error:util.format(err)                       //需要用到util转化err才能返回给客户端
        })
    }
}
