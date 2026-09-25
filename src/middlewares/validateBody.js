const HttpError = require('./httpError');

// Valida req.body com um schema Zod; se passar, substitui pelo dado já limpo
module.exports = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join('.') || '(body)',
      message: i.code === 'unrecognized_keys' ? `campo(s) não permitido(s): ${i.keys.join(', ')}` : i.message,
    }));
    return next(HttpError.badRequest('Dados inválidos', details));
  }
  req.body = result.data;
  next();
};
