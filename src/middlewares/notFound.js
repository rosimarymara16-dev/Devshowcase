const HttpError = require('./httpError');

// Rota inexistente: repassa para o errorHandler responder no formato padrão
module.exports = (req, _res, next) => {
  next(HttpError.notFound(`Rota ${req.method} ${req.originalUrl} não encontrada`));
};
