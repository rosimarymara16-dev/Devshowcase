// O Express 4 não captura erros de funções async: a rejeição é repassada para o next()
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
