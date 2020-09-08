import { live, sandbox } from '../../services/paypal';

const handShake = async (mode) => {
  try {
    const buff = Buffer.from(`${process.env.CLIENT_ID}:${process.env.SECRET}`);
    const credentialsParsed = buff.toString('base64');

    const headers = {
      Accept: 'application/json',
      'Accept-language': 'en_US',
      Authorization: `Basic ${credentialsParsed}`,
    };

    const body = 'grant_type=client_credentials';

    let response;

    switch (mode) {
      case 'sandbox':
        response = await sandbox.post('/v1/oauth2/token', body, { headers });
        break;

      case 'live':
        response = await live.post('/v1/oauth2/token', body, { headers });
        break;

      default:
        break;
    }
    return `bearer ${response.data.access_token}`;
  } catch (err) {
    return err;
  }
};

export default handShake;
