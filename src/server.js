import Fastify from 'fastify';
import routes from './routes.js';
import * as db from './db.js';
import config from './config.js';
import xero from './xero.js';

const app = Fastify({ logger: true });

await xero.init({
  logger: console.log,
  getStoredToken: () => db.get('tokenSet'),
  setStoredToken: (tokenSet) => db.set('tokenSet', tokenSet),
});

app.decorate('config', { getter: () => config });
app.decorate('db', { getter: () => db });
app.decorate('xero', { getter: () => xero });

app.register(routes);

await db.load();
app.listen(config.PORT);
