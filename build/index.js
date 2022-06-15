"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
app.get('/', (req, res) => {
    res.json({ name: "lgp", age: 18 });
});
app.listen(3000, () => {
    console.log('成功监听8000端口');
});
