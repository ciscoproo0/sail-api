import { Router } from 'express';

import PayPalCheckoutV1 from './app/controllers/paypal/PayPalCheckoutV1';

const routes = Router();

routes.post('/create-payment', PayPalCheckoutV1.createPayment);

routes.post('/execute-payment', PayPalCheckoutV1.executePayment);

routes.get('/gtd', PayPalCheckoutV1.getTransactionDetails);

export default routes;
