const nodemailer = require('nodemailer');
const send = nodemailer.createTransport({
    service: 'qq',
    port: 465,
    secureConnection: true,
    auth: {
        user: '907090585@qq.com',
        pass: 'cvxjaeubymkxbbic',
    }
});

const message =(user_email:string,securityCode:number)=>({
    from: '907090585@qq.com',
    to: user_email,
    subject: '欢迎使用note',
    html: `
    <div style="display:flex;flex-direction: column;gap: 50px">
      <p style="color: blue;font-size: 24px;text-align: center;margin-top: 50px" id="code">验证码: ${securityCode}</p>
      <div>
       <p>此验证码将在3分钟后!</p>
       <p style="font-weight:bold">非本人操作请忽略</p>
      </div>
   </div>
    `
}
)

//发送邮件
export const email=(user_email:string,security_code:number)=>{
    return new Promise((resolve,reject)=>{
        send.sendMail(message(user_email,security_code), (error:Error, info:string) => {
            if (error) {
                reject(error)
            }
            resolve("发送成功")
        });
    })
}



