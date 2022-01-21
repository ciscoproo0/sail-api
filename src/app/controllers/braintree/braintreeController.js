import * as Yup from 'yup';

import startGateway from './gatewayController';

class Braintree {
  async getClientToken(req, res) {
    const gateway = await startGateway(req.headers.mode, req.headers.type);
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

    const gateway = await startGateway(req.headers.mode, req.headers.type);

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

    const gateway = await startGateway(req.headers.mode, req.headers.type);

    const response = await gateway.transaction.sale({
      amount,
      merchantAccountId: 'BRL_Debito_Ready',
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

    const gateway = await startGateway(req.headers.mode, req.headers.type);

    const foundCustomer = await gateway.customer.find(customerId);

    if (foundCustomer.id) {
      return res.json(foundCustomer);
    }

    return res.status(400).json({ BraintreeError: foundCustomer });
  }

  async getTransactionDetails(req, res) {
    const { transactionId } = req.query;

    const gateway = await startGateway(req.headers.mode, req.headers.type);

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

export default new Braintree();
