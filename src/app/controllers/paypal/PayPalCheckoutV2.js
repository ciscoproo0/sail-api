import * as Yup from 'yup';

import { sandbox, live } from '../../services/paypal';

import handShake from './Oauth';

class PayPalCheckoutV2 {
  async CreateOrder(req, res) {
    const schema = Yup.object().shape({
      purchase_units: Yup.array().of(
        Yup.object().shape({
          amount: Yup.object()
            .shape({
              currency_code: Yup.string().required(),
              value: Yup.string().required(),
              breakdown: Yup.object().required(),
            })
            .required(),
          description: Yup.string(),
          items: Yup.array().required(),
          shipping: Yup.object(),
        })
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails body' });
    }

    const sess = req.session;
    if (!sess.tokenPP) {
      sess.tokenPP = await handShake(req.headers.mode);
    }
    const reference_id = Math.floor(Math.random() * 1000).toString();

    const {
      purchase_units: [
        {
          amount: {
            currency_code,
            value,
            breakdown: { item_total, shipping, shipping_discount, discount },
          },
          description,
          items,
          shipping: { address },
        },
      ],
    } = req.body;

    const headers = {
      'Content-Type': 'Application/json',
      Authorization: sess.tokenPP,
    };

    const body = {
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'Sail payment playground',
        locale: 'pt-BR',
        shipping_preference: shipping ? 'SET_PROVIDED_ADDRESS' : 'NO_SHIPPING',
        return_url: 'https://example.com/return',
        cancel_url: 'https://example.com/cancel',
      },
      purchase_units: [
        {
          reference_id,
          amount: {
            currency_code,
            value,
            breakdown: {
              item_total,
              shipping,
              shipping_discount,
              discount,
            },
          },
          description,
          soft_descriptor: 'Sail',
          items,
          shipping: { address },
        },
      ],
    };
    try {
      let response;

      switch (req.headers.mode) {
        case 'sandbox':
          response = await sandbox.post('/v2/checkout/orders', body, {
            headers,
          });
          break;

        case 'live':
          response = await live.post('/v2/checkout/orders', body, { headers });
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

  async CaptureOrder(req, res) {
    const schema = Yup.object().shape({
      orderId: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails body' });
    }

    const sess = req.session;
    if (!sess.tokenPP) {
      sess.tokenPP = await handShake(req.headers.mode);
    }

    const headers = {
      'Content-Type': 'Application/json',
      Authorization: sess.tokenPP,
    };

    const body = {};

    try {
      let response;

      switch (req.headers.mode) {
        case 'sandbox':
          response = await sandbox.post(
            `/v2/checkout/orders/${req.body.orderId}/capture`,
            body,
            {
              headers,
            }
          );
          break;

        case 'live':
          response = await live.post(
            `/v2/checkout/orders${req.body.orderId}/capture`,
            body,
            { headers }
          );
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

  async GetOrderInfo(req, res) {
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
          response = await sandbox.get(`/v2/checkout/orders/${id}`, {
            headers,
          });
          break;

        case 'live':
          response = await live.get(`/v2/checkout/orders/${id}`, { headers });
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

export default new PayPalCheckoutV2();
