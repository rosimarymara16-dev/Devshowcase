const HttpError = require('./httpError');

// Manipulador global: todo erro da API sai daqui no mesmo formato
// { status, error, message, details?, path, timestamp }

const titles = {
  400: 'Requisição inválida',
  404: 'Não encontrado',
  409: 'Conflito',
  413: 'Corpo da requisição muito grande',
  500: 'Erro interno do servidor',
};

// Mensagens para as restrições de unicidade do schema.sql
const uniqueMessages = {
  profiles_email_lower_key: 'Já existe um perfil com esse e-mail',
  technologies_name_lower_key: 'Já existe uma tecnologia com esse nome',
};

// Converte erros conhecidos (Express, body-parser e PostgreSQL) em HttpError
const toHttpError = (err) => {
  if (err instanceof HttpError) return err;

  // Id da rota com percent-encoding malformado (ex.: /api/projects/%ZZ/upvote): o Express não consegue
  // decodificar o parâmetro e lança URIError com status 400. O único parâmetro de rota da API é o id
  const badParam = err instanceof URIError && /^Failed to decode param '(.*)'$/.exec(err.message);
  if (badParam) {
    return HttpError.badRequest('O id deve ser um número inteiro positivo', [
      { field: 'id', message: `valor recebido "${badParam[1]}" não é um id válido` },
    ]);
  }

  // JSON malformado no corpo da requisição
  if (err.type === 'entity.parse.failed') {
    return HttpError.badRequest('JSON inválido no corpo da requisição. Confira aspas, vírgulas e chaves.');
  }
  if (err.type === 'entity.too.large') {
    return new HttpError(413, 'O corpo da requisição passou do tamanho máximo permitido (100 KB)');
  }
  // Demais erros de leitura do corpo (charset não suportado, envio interrompido...)
  if (err.expose && err.status >= 400 && err.status < 500) {
    return new HttpError(err.status, 'Não foi possível ler o corpo da requisição');
  }
  // Outros erros 4xx do Express (sem código do PostgreSQL) também são falha da requisição, não do servidor
  const status = err.status || err.statusCode;
  if (err instanceof URIError || (!err.code && status >= 400 && status < 500)) {
    return HttpError.badRequest('Requisição inválida. Confira a URL e os dados enviados.');
  }

  // Códigos de erro do PostgreSQL
  switch (err.code) {
    case '23505':
      return HttpError.conflict(uniqueMessages[err.constraint] || 'Registro duplicado: esse valor já está cadastrado');
    case '23503':
      if (err.constraint === 'project_technologies_technology_id_fkey') {
        return HttpError.badRequest('Tecnologia(s) não encontrada(s)', [
          { field: 'technologyIds', message: 'algum id informado não existe' },
        ]);
      }
      return HttpError.notFound('Registro relacionado não encontrado (pode ter sido removido)');
    case '22P02':
    case '22003':
    case '22001':
    case '23502':
    case '23514':
      return HttpError.badRequest('Valor inválido ou fora do intervalo permitido');
    default:
      return null;
  }
};

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, _next) => {
  let httpError = toHttpError(err);

  if (!httpError) {
    // Erro inesperado: o detalhe fica só no log do servidor
    console.error(err);
    httpError = new HttpError(500, 'Ocorreu um erro inesperado. Tente novamente em instantes.');
  }

  const { status, message, details } = httpError;
  res.status(status).json({
    status,
    error: titles[status] || (status < 500 ? 'Requisição não atendida' : titles[500]),
    message,
    details,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};
