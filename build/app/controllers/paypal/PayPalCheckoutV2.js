"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);

var _paypal = require('../../services/paypal');

var _Oauth = require('./Oauth'); var _Oauth2 = _interopRequireDefault(_Oauth);

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
      sess.tokenPP = await _Oauth2.default.call(void 0, req.headers.mode);
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
          response = await _paypal.sandbox.post('/v2/checkout/orders', body, {
            headers,
          });
          break;

        case 'live':
          response = await _paypal.live.post('/v2/checkout/orders', body, { headers });
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
      sess.tokenPP = await _Oauth2.default.call(void 0, req.headers.mode);
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
          response = await _paypal.sandbox.post(
            `/v2/checkout/orders/${req.body.orderId}/capture`,
            body,
            {
              headers,
            }
          );
          break;

        case 'live':
          response = await _paypal.live.post(
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
      sess.tokenPP = await _Oauth2.default.call(void 0, req.headers.mode);
    }

    const headers = {
      'Content-Type': 'Application/json',
      Authorization: sess.tokenPP,
    };

    try {
      let response;

      switch (req.headers.mode) {
        case 'sandbox':
          response = await _paypal.sandbox.get(`/v2/checkout/orders/${id}`, {
            headers,
          });
          break;

        case 'live':
          response = await _paypal.live.get(`/v2/checkout/orders/${id}`, { headers });
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

exports. default = new PayPalCheckoutV2();
