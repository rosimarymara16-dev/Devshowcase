const { z, requiredText, httpUrl, optionalText } = require('./common');
const { toTechnologyOutput } = require('./technologyDto');

const positiveId = (field) =>
  z.number({ required_error: `${field} é obrigatório`, invalid_type_error: `${field} deve ser número` })
    .int(`${field} deve ser inteiro`)
    .positive(`${field} deve ser positivo`);

// Entrada: POST /api/projects
const CreateProjectInput = z
  .object({
    title: requiredText('title', 150),
    description: optionalText('description', 1000),
    repositoryUrl: httpUrl('repositoryUrl'),
    demoUrl: httpUrl('demoUrl').optional().nullable(),
    profileId: positiveId('profileId'),
    technologyIds: z.array(positiveId('technologyIds[]')).default([]),
  })
  .strict();

const toFeedbackOutput = (row) => ({
  id: row.id,
  authorName: row.author_name,
  comment: row.comment,
  rating: row.rating,
  createdAt: row.created_at,
});

const toProjectOutput = (row, { profile, technologies = [], feedbacks = [] } = {}) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  repositoryUrl: row.repository_url,
  demoUrl: row.demo_url,
  createdAt: row.created_at,
  owner: profile ? { id: profile.id, name: profile.name } : { id: row.profile_id },
  technologies: technologies.map(toTechnologyOutput),
  feedbacks: feedbacks.map(toFeedbackOutput),
});

module.exports = { CreateProjectInput, toProjectOutput };
