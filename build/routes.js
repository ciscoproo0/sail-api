"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');

var _PayPalCheckoutV1 = require('./app/controllers/paypal/PayPalCheckoutV1'); var _PayPalCheckoutV12 = _interopRequireDefault(_PayPalCheckoutV1);

const routes = _express.Router.call(void 0, );

routes.post('/create-payment', _PayPalCheckoutV12.default.createPayment);

routes.post('/execute-payment', _PayPalCheckoutV12.default.executePayment);

routes.get('/gtd', _PayPalCheckoutV12.default.getTransactionDetails);

exports. default = routes;
