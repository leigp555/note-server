const cryptoMd5=require("crypto")
//获取crypto支持的散列算法
// console.log(cryptoMd5.getHashes())

export const md5=(str:string)=>{
    return cryptoMd5.createHash("md5")
        .update(str)
        .digest('hex')
}
