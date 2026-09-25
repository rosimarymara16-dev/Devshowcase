const HttpError = require('./httpError');
const { MAX_INT } = require('../dtos/common');

// Usado com router.param('id'): toda rota com :id só aceita inteiro positivo
module.exports = (_req, _res, next, value) => {
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > MAX_INT) {
    return next(
      HttpError.badRequest('O id deve ser um número inteiro positivo', [
        { field: 'id', message: `valor recebido "${value}" não é um id válido` },
      ])
    );
  }
  next();
};
