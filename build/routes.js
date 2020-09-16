"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');

var _PayPalCheckoutV1 = require('./app/controllers/paypal/PayPalCheckoutV1'); var _PayPalCheckoutV12 = _interopRequireDefault(_PayPalCheckoutV1);
var _PayPalCheckoutV2 = require('./app/controllers/paypal/PayPalCheckoutV2'); var _PayPalCheckoutV22 = _interopRequireDefault(_PayPalCheckoutV2);
var _braintreeController = require('./app/controllers/braintree/braintreeController'); var _braintreeController2 = _interopRequireDefault(_braintreeController);

const routes = _express.Router.call(void 0, );

routes.post('/create-payment', _PayPalCheckoutV12.default.createPayment);

routes.post('/execute-payment', _PayPalCheckoutV12.default.executePayment);

routes.get('/gtd', _PayPalCheckoutV12.default.getTransactionDetails);

routes.post('/create-order', _PayPalCheckoutV22.default.CreateOrder);

routes.post('/capture-order', _PayPalCheckoutV22.default.CaptureOrder);

routes.get('/goi', _PayPalCheckoutV22.default.GetOrderInfo);

routes.get('/bt/client-token', _braintreeController2.default.getClientToken);

routes.post('/bt/execute-transaction', _braintreeController2.default.executeTransaction);

routes.post('/bt/tokenize', _braintreeController2.default.createVault);

routes.get('/bt/get-customer-info', _braintreeController2.default.getCustomerInfo);

routes.get('/bt/gtd', _braintreeController2.default.getTransactionDetails);

exports. default = routes;
