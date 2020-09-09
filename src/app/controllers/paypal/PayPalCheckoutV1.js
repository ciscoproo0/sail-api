import * as Yup from 'yup';

import { sandbox, live } from '../../services/paypal';

import handShake from './Oauth';

class PayPalCheckoutV1 {
  async createPayment(req, res) {
    const schema = Yup.object().shape({
      amount: Yup.object()
        .shape({
          total: Yup.string().required(),
          currency: Yup.string().required(),
          details: Yup.object()
            .shape({
              subtotal: Yup.string().required(),
              shipping: Yup.string(),
              shipping_discount: Yup.string(),
            })
            .required(),
        })
        .required(),
      description: Yup.string(),
      custom: Yup.string(),
      items: Yup.array().required(),
      shipping_address: Yup.object(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails body' });
    }

    const sess = req.session;
    if (!sess.tokenPP) {
      sess.tokenPP = await handShake(req.headers.mode);
    }

    const {
      amount: {
        total,
        currency,
        details: { subtotal, shipping, shipping_discount },
      },
      description,
      custom,
      items,
      shipping_address,
    } = req.body;
    let headers = '';

    if (req.headers.mock) {
      const { mock } = req.headers;
      headers = {
        'Content-Type': 'application/json',
        Authorization: sess.tokenPP,
        'PayPal-Mock-Response': `{"mock_application_codes": "${mock}"}`,
      };
    } else {
      headers = {
        'Content-Type': 'Application/json',
        Authorization: sess.tokenPP,
      };
    }

    const body = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      application_context: {
        locale: 'pt_BR',
        brand_name: 'payments-playground',
        shipping_preference: shipping_address
          ? 'SET_PROVIDED_ADDRESS'
          : 'NO_SHIPPING',
        user_action: 'continue',
      },
      transactions: [
        {
          amount: {
            total,
            currency,
            details: {
              subtotal,
              shipping,
              shipping_discount,
            },
          },
          description,
          custom: custom && custom,
          invoice_number: Math.floor(Math.random() * 100000),
          payment_options: {
            allowed_payment_method:
              req.headers.type === 'ppplus'
                ? 'IMMEDIATE_PAY'
                : 'INSTANT_FUNDING_SOURCE',
          },
          soft_descriptor: 'payments-playground',
          item_list: {
            items,
            shipping_address,
          },
        },
      ],
      note_to_payer:
        'Compra feita na payments-playground, caso tenha dúvidas, contate payments-playground@gmail.com',
      redirect_urls: {
        return_url: 'https://example.com/return',
        cancel_url: 'https://example.com/cancel',
      },
    };

    try {
      let response;

      switch (req.headers.mode) {
        case 'sandbox':
          response = await sandbox.post('/v1/payments/payment', body, {
            headers,
          });
          break;

        case 'live':
          response = await live.post('/v1/payments/payment', body, { headers });
          break;

        default:
          break;
      }

      return res.json(response.data);
    } catch (err) {
      return res
        .status(400)
        .json({ message: 'PayPal Error', original_message: err.message });
    }
  }

  async executePayment(req, res) {
    const schema = Yup.object().shape({
      paymentId: Yup.string().required(),
      payerId: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const sess = req.session;

    if (!sess.tokenPP) {
      sess.tokenPP = await handShake(req.headers.mode);
    }

    const { paymentId, payerId } = req.body;

    let headers;

    if (req.headers.mock) {
      const { mock } = req.headers;
      headers = {
        'Content-Type': 'application/json',
        Authorization: sess.tokenPP,
        'PayPal-Mock-Response': `{"mock_application_codes": "${mock}"}`,
      };
    } else {
      headers = {
        'Content-Type': 'Application/json',
        Authorization: sess.tokenPP,
      };
    }

    const body = {
      payer_id: payerId,
    };

    try {
      let response;

      switch (req.headers.mode) {
        case 'sandbox':
          response = await sandbox.post(
            `/v1/payments/payment/${paymentId}/execute`,
            body,
            {
              headers,
            }
          );
          break;

        case 'live':
          response = await live.post(
            `/v1/payments/payment/${paymentId}/execute`,
            body,
            { headers }
          );
          break;

        default:
          break;
      }

      return res.json(response.data);
    } catch (err) {
      if (err.response.status >= 400) {
        return res.status(400).json({
          messaeg: 'PayPal Error',
          original_message: err.response.data,
        });
      }
      return res.status(400).json({ error: err.response.data });
    }
  }

  async getTransactionDetails(req, res) {
    const sess = req.session;
    const { id } = req.query;

    if (!sess.tokenPP) {
      sess.tokenPP = await handShake(req.headers.mode);
    }

    const headers = {
      'Content-Type': 'Application/json',
      Authorization: sess.tokenPP,
    };

    try {
      let response;

      switch (req.headers.mode) {
        case 'sandbox':
          response = await sandbox.get(`/v1/payments/payment/${id}`, {
            headers,
          });
          break;

        case 'live':
          response = await live.get(`/v1/payments/payment/${id}`, { headers });
          break;

        default:
          break;
      }
      return res.json(response.data);
    } catch (err) {
      return res
        .status(400)
        .json({ message: 'PayPal Error', original_message: err.message });
    }
  }
}

export default new PayPalCheckoutV1();
