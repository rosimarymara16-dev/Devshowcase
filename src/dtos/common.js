const { z } = require('zod');

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
  z.string({ invalid_type_error: `${field} deve ser texto` }).trim().max(max).optional().nullable();

module.exports = { z, requiredText, httpUrl, optionalText };
