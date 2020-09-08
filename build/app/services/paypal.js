"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

 const live = _axios2.default.create({
  baseURL: 'https://api.paypal.com',
}); exports.live = live;

 const sandbox = _axios2.default.create({
  baseURL: 'https://api.sandbox.paypal.com',
}); exports.sandbox = sandbox;
