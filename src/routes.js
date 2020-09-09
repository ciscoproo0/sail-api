import { Router } from 'express';

import PayPalCheckoutV1 from './app/controllers/paypal/PayPalCheckoutV1';
import PayPalCheckoutV2 from './app/controllers/paypal/PayPalCheckoutV2';

const routes = Router();

routes.post('/create-payment', PayPalCheckoutV1.createPayment);

routes.post('/execute-payment', PayPalCheckoutV1.executePayment);

routes.get('/gtd', PayPalCheckoutV1.getTransactionDetails);

routes.post('/create-order', PayPalCheckoutV2.CreateOrder);

routes.post('/capture-order', PayPalCheckoutV2.CaptureOrder);

routes.get('/goi', PayPalCheckoutV2.GetOrderInfo);

export default routes;
