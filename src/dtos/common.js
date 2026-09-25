const { z } = require('zod');

const MAX_INT = 2147483647; // maior valor da coluna INTEGER do PostgreSQL

const typeNames = {
  string: 'texto',
  number: 'número',
  integer: 'número inteiro',
  boolean: 'verdadeiro/falso',
  object: 'objeto JSON',
  array: 'lista',
};

// Mensagens padrão em português para os casos que não têm mensagem própria no schema
z.setErrorMap((issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === 'undefined') return { message: 'campo obrigatório' };
    return { message: `deve ser ${typeNames[issue.expected] || issue.expected}` };
  }
  if (issue.code === z.ZodIssueCode.invalid_string) return { message: 'formato inválido' };
  return { message: ctx.defaultError };
});

// Texto obrigatório: remove espaços das pontas e não aceita string vazia
const requiredText = (field, max = 150) =>
  z
    .string({ required_error: `${field} é obrigatório`, invalid_type_error: `${field} deve ser texto` })
    .trim()
    .min(1, `${field} não pode ser vazio`)
    .max(max, `${field} deve ter no máximo ${max} caracteres`);

// URL válida (precisa começar com http:// ou https://)
const isHttpUrl = (value) => {
  try {
    const { protocol, hostname } = new URL(value);
    return (protocol === 'http:' || protocol === 'https:') && hostname.includes('.');
  } catch {
    return false;
  }
};

const httpUrl = (field) =>
  z
    .string({ required_error: `${field} é obrigatório`, invalid_type_error: `${field} deve ser texto` })
    .trim()
    .refine(isHttpUrl, `${field} deve ser uma URL válida (ex.: https://github.com/usuario)`);

const optionalText = (field, max = 500) =>
  z
    .string({ invalid_type_error: `${field} deve ser texto` })
    .trim()
    .max(max, `${field} deve ter no máximo ${max} caracteres`)
    .optional()
    .nullable();

// Número inteiro vindo da query string (?page=2): só converte texto com dígitos (mesmo critério do
// validateId), então 1e1, 0x2 e " 10" continuam texto e são recusados; depois valida o intervalo
const queryInt = (field, min, max) => {
  const range = max ? `entre ${min} e ${max}` : `maior ou igual a ${min}`;
  return z.preprocess(
    (value) => (typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value),
    z
      .number({ invalid_type_error: `${field} deve ser um número inteiro` })
      .min(min, `${field} deve ser ${range}`)
      .max(max ?? MAX_INT, max ? `${field} deve ser ${range}` : `${field} deve ser no máximo ${MAX_INT}`)
  );
};

module.exports = { z, MAX_INT, requiredText, httpUrl, optionalText, queryInt };
