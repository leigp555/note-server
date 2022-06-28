import { Response } from "express";
const https = require("https");
const querystring = require("querystring");
const md5 = require("md5");

const appid = "20211103000989826";
const password = "yrJJUdojTBFTnB4SH_9Z";
const salt = Math.random();

export const translate = (word: string, from: string, to: string) => {
  return new Promise((resolve, reject) => {
    const query = querystring.stringify({
      q: word,
      from,
      to,
      appid,
      salt,
      sign: md5(appid + word + salt + password),
    });
    const options = {
      hostname: "api.fanyi.baidu.com",
      port: 443,
      path: "/api/trans/vip/translate?" + query,
      method: "GET",
    };
    const request = https.request(options, (response: Response) => {
      const arr = [] as Buffer[];
      response.on("data", (chunk: Buffer) => {
        arr.push(chunk);
      });
      response.on("end", () => {
        const string = Buffer.concat(arr).toString();
        const obj = JSON.parse(string);
        if (obj.error_code) {
          reject(obj.error_msg);
        } else {
          if (obj.trans_result[0].dst) resolve(obj.trans_result[0].dst);
        }
      });
    });
    request.on("error", (error: string) => {
      reject(error);
    });
    request.end();
  });
};
