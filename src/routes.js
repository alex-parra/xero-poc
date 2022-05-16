export default (app, opts, done) => {
  const { xero } = app;

  app.get('/', { onRequest: [xero.ensureConnected] }, async (req, res) => {
    const [activeTenant] = xero.tenants;
    const { body } = await xero.accountingApi.getOrganisations(activeTenant.tenantId);
    const [org] = body.organisations;
    return { expiresIn: xero.expiresIn(), org };
  });

  app.get('/connect', { onRequest: [xero.ensureNotConnected] }, async (req, res) => {
    const url = await xero.buildConsentUrl();

    res.type('text/html');
    res.send(`<a href="${url}">Connect to Xero</a>`);
  });

  app.get('/callback', { onRequest: [xero.ensureNotConnected] }, async (req, res) => {
    await xero.connectCallback(req.url);
    res.redirect('/');
  });

  done();
};
