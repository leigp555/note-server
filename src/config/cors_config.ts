//跨域处理中间件配置
export const corsOptions = {
    origin: 'http://localhost:4500',
    methods:['GET', 'PUT', 'POST','OPTIONS','PATCH','HEAD','DELETE'],
    allowedHeaders:['Content-Type', 'Authorization','Origin', 'X-Requested-With','Accept'],
    optionsSuccessStatus: 200,
    credentials:true,
    maxAge:600,
};
