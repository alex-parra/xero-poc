import dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: process.env.PORT,
  XERO_ID: process.env.CLIENT_ID,
  XERO_SECRET: process.env.CLIENT_SECRET,
  XERO_REDIRECT: process.env.REDIRECT_URI,
};
