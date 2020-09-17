
"use strict";

// Load environment variables from the `.env` file.
require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";

const config = {
  // Default country for the checkout form.
  country: "US",

  // Store currency.
  currency: "eur",

  // Configuration for Paypal.
  paypal: {
    clientID: process.env.PAYPAL_CLIENT_ID,
    secretKey: process.env.PAYPAL_SECRET_KEY,
  },

  shipengine: {
    stampsCarrierID: isProd ? process.env.SHIPENGINE_PROD_SDC_CARRIER_ID : process.env.SHIPENGINE_SANDBOX_SDC_CARRIER_ID,
    apiKey: isProd ? process.env.SHIPENGINE_PROD_API_KEY : process.env.SHIPENGINE_SANDBOX_API_KEY
  },

  shippenguin: {
    // url: isProd ? process.env.SHIPPENGUIN_URL : `https://${process.env.NGROK_SUBDOMAIN}.ngrok.io`
    // url: isProd ? process.env.SHIPPENGUIN_URL : `http://localhost:${process.env.PORT}`
  },

  iovation: {
    subscriberID: isProd ? process.env.SUBSCRIBER_ID : process.env.DEV_SUBSCRIBER_ID,
    subscriberAccount: isProd ? process.env.SUBSCRIBER_ACCOUNT : process.env.DEV_SUBSCRIBER_ACCOUNT,
    passCode: isProd ? process.env.SUBSCRIBER_PASS_CODE : process.env.DEV_SUBSCRIBER_PASS_CODE
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY
  },

  // Server port.
  port: process.env.PORT || 8000,

  // Tunnel to serve the app over HTTPS and be able to receive webhooks locally.
  // Optionally, if you have a paid ngrok account, you can specify your `subdomain`
  // and `authtoken` in your `.env` file to use it.
  ngrok: {
    enabled: process.env.ENABLE_NGROK === true,
    port: process.env.PORT || 8000,
    subdomain: process.env.NGROK_SUBDOMAIN,
    authtoken: process.env.NGROK_AUTHTOKEN,
  },
  slackChannel: process.env.SLACK_CHANNEL_ID
};

config.iovation.url = isProd ? `https://api.iovation.com/fraud/v1/subs/${config.iovation.subscriberID}/checks` : `https://ci-api.iovation.com/fraud/v1/subs/${config.iovation.subscriberID}/checks`;

config.shippenguin.url = isProd ? process.env.SHIPPENGUIN_URL : `http://localhost:${config.port}`;


module.exports = config;