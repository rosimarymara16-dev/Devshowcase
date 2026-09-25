const { z, MAX_INT, requiredText, httpUrl, optionalText, queryInt } = require('./common');
const { toTechnologyOutput } = require('./technologyDto');
const { toFeedbackOutput } = require('./feedbackDto');

const positiveId = (field) =>
  z.number({ required_error: `${field} é obrigatório`, invalid_type_error: `${field} deve ser número` })
    .int(`${field} deve ser inteiro`)
    .positive(`${field} deve ser positivo`)
    .max(MAX_INT, `${field} deve ser um id válido`);

// Entrada: POST /api/projects
const CreateProjectInput = z
  .object({
    title: requiredText('title', 150),
    description: optionalText('description', 1000),
    repositoryUrl: httpUrl('repositoryUrl'),
    demoUrl: httpUrl('demoUrl').optional().nullable(),
    profileId: positiveId('profileId'),
    technologyIds: z
      .array(positiveId('technologyIds[]'), { invalid_type_error: 'technologyIds deve ser uma lista de ids' })
      .default([]),
  })
  .strict();

// Query string: GET /api/projects?technology=react&page=1&limit=10
const ListProjectsQuery = z
  .object({
    technology: z
      .string({ invalid_type_error: 'technology deve ser informado uma única vez' })
      .trim()
      .max(60, 'technology deve ter no máximo 60 caracteres')
      .optional(),
    page: queryInt('page', 1).default(1),
    limit: queryInt('limit', 1, 50).default(10),
  })
  .strict();

// O pg devolve NUMERIC como texto, então a média é convertida para número aqui
const toProjectOutput = (row, { profile, technologies = [], feedbacks = [] } = {}) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  repositoryUrl: row.repository_url,
  demoUrl: row.demo_url,
  upvotes: row.upvotes,
  averageRating: row.average_rating === null ? null : Number(row.average_rating),
  totalFeedbacks: feedbacks.length,
  createdAt: row.created_at,
  owner: profile ? { id: profile.id, name: profile.name } : { id: row.profile_id },
  technologies: technologies.map(toTechnologyOutput),
  feedbacks: feedbacks.map(toFeedbackOutput),
});

module.exports = { CreateProjectInput, ListProjectsQuery, toProjectOutput };
