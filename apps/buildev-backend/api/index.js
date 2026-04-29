"use strict";
const serverless = require("serverless-http");
const mod = require("../dist/index.js");
const app = mod.default ?? mod;
module.exports = serverless(app);
