"use strict";

/**
 * Entrada serverless para Vercel: ejecuta la app Express compilada en `dist/`.
 * Sin este archivo, Vercel puede tratar `dist/` como estático y servir el JS en crudo.
 *
 * En el panel de Vercel (proyecto del API): Output Directory vacío; Root Directory = apps/buildev-backend.
 */
const mod = require("../dist/index.js");
module.exports = mod.default ?? mod;
