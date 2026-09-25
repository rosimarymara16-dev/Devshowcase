const { z, requiredText, httpUrl, optionalText } = require('./common');

// Entrada: POST /api/profiles
const CreateProfileInput = z
  .object({
    name: requiredText('name', 120),
    email: z
      .string({ required_error: 'email é obrigatório', invalid_type_error: 'email deve ser texto' })
      .trim()
      .toLowerCase()
      .email('email deve ser um e-mail válido'),
    bio: optionalText('bio', 500),
    githubUrl: httpUrl('githubUrl').optional().nullable(),
  })
  .strict();

// Saída: esconde nomes de colunas do banco e padroniza em camelCase
const toProfileOutput = (row, projects = []) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  bio: row.bio,
  githubUrl: row.github_url,
  createdAt: row.created_at,
  projects: projects.map((p) => ({ id: p.id, title: p.title, repositoryUrl: p.repository_url })),
});

module.exports = { CreateProfileInput, toProfileOutput };
