const { z, requiredText } = require('./common');

// Entrada: POST /api/projects/{id}/feedbacks
const CreateFeedbackInput = z
  .object({
    authorName: requiredText('authorName', 120),
    comment: requiredText('comment', 1000),
    rating: z
      .number({ required_error: 'rating é obrigatório', invalid_type_error: 'rating deve ser número' })
      .int('rating deve ser um número inteiro')
      .min(1, 'rating deve ser no mínimo 1')
      .max(5, 'rating deve ser no máximo 5'),
  })
  .strict();

const toFeedbackOutput = (row) => ({
  id: row.id,
  projectId: row.project_id,
  authorName: row.author_name,
  comment: row.comment,
  rating: row.rating,
  createdAt: row.created_at,
});

module.exports = { CreateFeedbackInput, toFeedbackOutput };
