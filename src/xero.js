import { XeroClient } from 'xero-node';
import config from './config.js';

const params = {
  clientId: config.XERO_ID,
  clientSecret: config.XERO_SECRET,
  redirectUris: [config.XERO_REDIRECT],
  scopes: [
    'openid',
    'offline_access',
    'email',
    'profile',
    'accounting.settings',
    'accounting.reports.read',
    'accounting.journals.read',
    'accounting.contacts',
    'accounting.attachments',
    'accounting.transactions',
  ],
};

class Xero extends XeroClient {
  logger = console.log;
  getStoredToken = () => null;
  setStoredToken = () => null;

  async init({ logger, getStoredToken, setStoredToken }) {
    await this.initialize();

    this.logger = logger;
    this.getStoredToken = getStoredToken;
    this.setStoredToken = setStoredToken;
  }

  expiresIn = () => {
    const tokenSet = this.readTokenSet();
    const now = Math.floor(Date.now() / 1000);
    const remainderSeconds = tokenSet.expires_at - now;
    const hms = new Date(remainderSeconds * 1000).toISOString().substring(11, 19);
    return hms;
  };

  connectCallback = async (url) => {
    const tokenSet = await this.apiCallback(url);
    await this.setStoredToken(tokenSet);
    await this.updateTenants();
  };

  authenticate = async () => {
    this.logger('Xero: authenticate');
    let tokenSet = this.readTokenSet();

    if (!tokenSet?.access_token) {
      this.logger('Xero: no token set');
      const storedToken = await this.getStoredToken();
      if (!storedToken?.access_token) {
        this.logger('Xero: no stored token');
        return false;
      }
      this.logger('Xero: applied stored token');
      await this.setTokenSet(storedToken);
      tokenSet = this.readTokenSet();
    }

    if (tokenSet.expired()) {
      this.logger('Xero: token expired, refreshing');
      await this.refreshToken();
      tokenSet = this.readTokenSet();
      await this.setStoredToken(tokenSet);
    }

    if (!tokenSet.expired()) {
      this.logger('Xero: token valid');
      await this.updateTenants();
      return true;
    }

    this.logger('Xero: token invalid');
    return false;
  };

  ensureConnected = async (req, res) => {
    const authenticated = await this.authenticate();
    if (!authenticated) {
      res.redirect('/connect');
    }
  };

  ensureNotConnected = async (req, res) => {
    const authenticated = await this.authenticate();
    if (authenticated) {
      res.redirect('/');
    }
  };
}

export default new Xero(params);
