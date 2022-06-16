import dayjs, {Dayjs} from "dayjs";
import {ArticleItem, AvatarItem, CanvasImg, UserItem} from "../common/type";
export const createDate={
    //创建用户对象
    user(username:string,email:string,password:string){
        return ({
            username,
            email,
            password,
            createdAt:dayjs(),
            updatedAt:dayjs()
        })
    },
    //创建文章对象
    article(owner:string,title:string,body:string,state:string,isPublic='false'):ArticleItem{
        return ({
            owner,
            title,
            body,
            state,
            isPublic,
            createdAt:dayjs(),
            updatedAt:dayjs(),
        })
    },
    //创建头像对象
    avatar(owner:string,body:string):AvatarItem{
        return ({
            owner ,
            body ,
            createdAt:dayjs(),
            updatedAt:dayjs()
        })
    },
    //创建canvas图片对象
    canvasImg(owner:string,body:string,isPublic="false"):CanvasImg{
        return ({
            owner ,
            body ,
            isPublic,
            createdAt:dayjs(),
            updatedAt:dayjs()
        })
    }
}
