const jwt=require('jsonwebtoken')

const {promisify}=require('util')

export const sign=promisify(jwt.sign)

export const verify = promisify(jwt.verify)

