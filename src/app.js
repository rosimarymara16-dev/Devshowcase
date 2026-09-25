const express = require('express');
const swaggerUi = require('swagger-ui-express');
const routes = require('./routes');
const openapi = require('./docs/openapi');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/', (_req, res) => res.redirect('/docs'));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Documentação interativa (Swagger UI) e a especificação em JSON
app.get('/openapi.json', (_req, res) => res.json(openapi));
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    customSiteTitle: 'DevShowcase API - Grupo 2',
    swaggerOptions: { docExpansion: 'list', displayRequestDuration: true, tryItOutEnabled: true },
  })
);

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
