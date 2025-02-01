"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _axios = _interopRequireDefault(require("axios"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Define a tipagem para a instância da API
const api = _axios.default.create({
  baseURL: "https://api.pagar.me/core/v5/",
  auth: {
    username: process.env.PAGARME_SECRETE_KEY,
    password: ""
  }
});
var _default = exports.default = api;