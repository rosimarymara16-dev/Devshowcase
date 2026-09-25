const HttpError = require('./httpError');

// eslint-disable-next-line no-unused-vars
module.exports = (err, _req, res, _next) => {
  // JSON malformado no corpo da requisição
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 400, error: 'JSON inválido no corpo da requisição' });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ status: err.status, error: err.message, details: err.details });
  }

  console.error(err);
  return res.status(500).json({ status: 500, error: 'Erro interno do servidor' });
};
