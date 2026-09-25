const HttpError = require('./httpError');

// Valida req.query com um schema Zod (converte page/limit para número e aplica os valores padrão)
module.exports = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) return next(HttpError.fromZod(result.error, 'Parâmetros de consulta inválidos', '(query)'));
  req.query = result.data;
  next();
};
