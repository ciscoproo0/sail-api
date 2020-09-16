"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _braintree = require('braintree'); var _braintree2 = _interopRequireDefault(_braintree);

const startGateway = async (mode, type) => {
  try {
    let result;
    switch (mode) {
      case 'sandbox':
        if (type === 'ecbt') {
          result = new (0, _braintree.BraintreeGateway)({
            accessToken: process.env.ACCESS_TOKEN_SB,
          });
        } else {
          result = new (0, _braintree.BraintreeGateway)({
            environment: _braintree2.default.Environment.Sandbox,
            merchantId: process.env.MERCHANT_ID_SB,
            publicKey: process.env.PUBLIC_KEY_SB,
            privateKey: process.env.PRIVATE_KEY_SB,
          });
        }
        break;

      case 'live':
        if (type === 'dcc') {
          result = new (0, _braintree.BraintreeGateway)({
            accessToken: process.env.ACCESS_TOKEN,
          });
        } else {
          result = new (0, _braintree.BraintreeGateway)({
            environment: _braintree2.default.Environment.Production,
            merchantId: process.env.MERCHANT_ID,
            publicKey: process.env.PUBLIC_KEY,
            privateKey: process.env.PRIVATE_KEY,
          });
        }
        break;

      default:
        break;
    }

    return result;
  } catch (err) {
    return err.message;
  }
};

exports. default = startGateway;
