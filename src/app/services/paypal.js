import axios from 'axios';

export const live = axios.create({
  baseURL: 'https://api.paypal.com',
});

export const sandbox = axios.create({
  baseURL: 'https://api.sandbox.paypal.com',
});
