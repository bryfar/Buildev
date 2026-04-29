"use strict";

/**
 * Entrada serverless para Vercel: ejecuta la app Express compilada en `dist/`.
 * `serverless-http` adapta (req,res) al runtime serverless de Vercel.
 *
 * Panel Vercel (proyecto del API): Output Directory vacío; Root = apps/buildev-backend; Framework Other.
 */
const serverless = require("serverless-http");
const mod = require("../dist/index.js");
const app = mod.default ?? mod;
module.exports = serverless(app);
