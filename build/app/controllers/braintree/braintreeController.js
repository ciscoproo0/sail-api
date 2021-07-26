"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);

var _gatewayController = require('./gatewayController'); var _gatewayController2 = _interopRequireDefault(_gatewayController);

class Braintree {
  async getClientToken(req, res) {
    const gateway = await _gatewayController2.default.call(void 0, req.headers.mode, req.headers.type);
    const response = await gateway.clientToken.generate();

    return res.json(response.clientToken);
  }

  async executeTransaction(req, res) {
    const schema = Yup.object().shape({
      nonce: Yup.string(),
      amount: Yup.string().required(),
      dataInfo: Yup.string(),
      customerId: Yup.string(),
      paymentMethodToken: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails body' });
    }

    const {
      nonce,
      amount,
      dataInfo,
      customerId,
      paymentMethodToken,
    } = req.body;

    const gateway = await _gatewayController2.default.call(void 0, req.headers.mode, req.headers.type);

    const response = await gateway.transaction.sale({
      amount,
      paymentMethodNonce: nonce || null,
      deviceData: dataInfo || null,
      customerId: customerId || null,
      paymentMethodToken: paymentMethodToken || null,
      options: {
        submitForSettlement: true,
      },
    });

    if (response.success) {
      return res.json(response);
    }

    return res.json({
      transactionFailed: response.message,
    });
  }

  async createVault(req, res) {
    const schema = Yup.object().shape({
      nonce: Yup.string().required(),
      amount: Yup.string().required(),
      dataInfo: Yup.string(),
      customer: Yup.object()
        .shape({
          firstName: Yup.string().required(),
          lastName: Yup.string().required(),
          email: Yup.string().required(),
          phone: Yup.string().required(),
        })
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails body' });
    }

    const { nonce, amount, dataInfo, customer } = req.body;

    const gateway = await _gatewayController2.default.call(void 0, req.headers.mode, req.headers.type);

    const response = await gateway.transaction.sale({
      amount,
      installments: {count: 4},
      merchantAccountId: 'BRL',
      paymentMethodNonce: nonce,
      deviceData: dataInfo || null,
      customer,
      options: {
        storeInVault: true,
        storeInVaultOnSuccess: true,
        submitForSettlement: true,
      },
    });

    const foundCustomer = gateway.customer.find(
      response.transaction.customer.id
    );

    if (response.success) {
      return res.json({
        CustomerDetails: foundCustomer,
        FullResponse: response,
      });
    }

    return res.json({
      transactionFailed: response.message,
    });
  }

  async getCustomerInfo(req, res) {
    const { customerId } = req.query;

    const gateway = await _gatewayController2.default.call(void 0, req.headers.mode, req.headers.type);

    const foundCustomer = await gateway.customer.find(customerId);

    if (foundCustomer.id) {
      return res.json(foundCustomer);
    }

    return res.status(400).json({ BraintreeError: foundCustomer });
  }

  async getTransactionDetails(req, res) {
    const { transactionId } = req.query;

    const gateway = await _gatewayController2.default.call(void 0, req.headers.mode, req.headers.type);

    gateway.transaction.search(
      (search) => {
        search.id().is(transactionId);
      },
      (err1, response) => {
        return response.each((err2, transaction) => {
          if (err2) {
            return res.json({ BraintreeError: err2 });
          }
          return res.json(transaction);
        });
      }
    );
  }
}

exports. default = new Braintree();
