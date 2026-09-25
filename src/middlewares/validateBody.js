const HttpError = require('./httpError');

// Valida req.body com um schema Zod; se passar, substitui pelo dado já limpo
module.exports = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) return next(HttpError.fromZod(result.error, 'Dados inválidos'));
  req.body = result.data;
  next();
};
