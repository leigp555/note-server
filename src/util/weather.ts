const https = require("http");
import { Response } from "express";
const querystring = require("querystring");

//https://api.seniverse.com/v3/weather/now.json?key=SDi6BpkMusDpqLf3l&location=hangzhou&language=zh-Hans&unit=c
//https://api.seniverse.com/v3/weather/now.json?key=SDi6BpkMusDpqLf3l&location=hangzhou&language=zh-Hans&unit=c
export const getWeather = (location: string) => {
  const query = querystring.stringify({
    key: "SDi6BpkMusDpqLf3l",
    location,
    language: "zh-Hans",
    unit: "c",
  });
  const options = {
    hostname: "api.seniverse.com",
    port: 80,
    path: "/v3/weather/now.json?" + query,
    method: "GET",
  };
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response: Response) => {
      const arr = [] as Buffer[];
      response.on("data", (chunk: Buffer) => {
        arr.push(chunk);
      });
      response.on("end", () => {
        const string = Buffer.concat(arr).toString();
        let obj;
        try {
          obj = JSON.parse(string);
        } catch (err) {
          obj = { results: [] };
        }
        resolve(obj.results[0]);
      });
    });
    request.on("error", (error: string) => {
      reject(error);
    });
    request.end();
  });
};
