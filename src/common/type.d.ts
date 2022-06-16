import {Dayjs} from "dayjs";

export type Register = {
    username: string;
    email: string;
    password: string;
    securityCode: string;
};

export interface UserItem{
    id?:number,
    username:string
    email:string,
    password:string,
    createdAt:Dayjs,
    updatedAt:Dayjs
}

export interface ArticleItem{
    id?:number,
    owner:string,
    title:string,
    body:string,
    state:string,
    isPublic:string,
    createdAt:Dayjs,
    updatedAt:Dayjs
}

export interface AvatarItem{
    id ?:number,
    owner :string,
    body :string,
    createdAt:Dayjs,
    updatedAt:Dayjs
}

export interface CanvasImg{
    id ?:number,
    owner :string,
    body :string,
    isPublic:string,
    createdAt:Dayjs,
    updatedAt:Dayjs
}
