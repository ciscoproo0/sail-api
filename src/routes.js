import { Router } from 'express';

import PayPalCheckoutV1 from './app/controllers/paypal/PayPalCheckoutV1';
import PayPalCheckoutV2 from './app/controllers/paypal/PayPalCheckoutV2';
import braintreeController from './app/controllers/braintree/braintreeController';

const routes = Router();

routes.post('/create-payment', PayPalCheckoutV1.createPayment);

routes.post('/execute-payment', PayPalCheckoutV1.executePayment);

routes.get('/gtd', PayPalCheckoutV1.getTransactionDetails);

routes.post('/create-order', PayPalCheckoutV2.CreateOrder);

routes.post('/capture-order', PayPalCheckoutV2.CaptureOrder);

routes.get('/goi', PayPalCheckoutV2.GetOrderInfo);

routes.get('/bt/client-token', braintreeController.getClientToken);

routes.post('/bt/execute-transaction', braintreeController.executeTransaction);

routes.post('/bt/tokenize', braintreeController.createVault);

routes.get('/bt/get-customer-info', braintreeController.getCustomerInfo);

routes.get('/bt/gtd', braintreeController.getTransactionDetails);

export default routes;
