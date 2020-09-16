import braintree, { BraintreeGateway } from 'braintree';

const startGateway = async (mode, type) => {
  try {
    let result;
    switch (mode) {
      case 'sandbox':
        if (type === 'ecbt') {
          result = new BraintreeGateway({
            accessToken: process.env.ACCESS_TOKEN_SB,
          });
        } else {
          result = new BraintreeGateway({
            environment: braintree.Environment.Sandbox,
            merchantId: process.env.MERCHANT_ID_SB,
            publicKey: process.env.PUBLIC_KEY_SB,
            privateKey: process.env.PRIVATE_KEY_SB,
          });
        }
        break;

      case 'live':
        if (type === 'dcc') {
          result = new BraintreeGateway({
            accessToken: process.env.ACCESS_TOKEN,
          });
        } else {
          result = new BraintreeGateway({
            environment: braintree.Environment.Production,
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

export default startGateway;
