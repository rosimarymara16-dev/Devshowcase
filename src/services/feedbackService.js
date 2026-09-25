const projectRepository = require('../repositories/projectRepository');
const feedbackRepository = require('../repositories/feedbackRepository');
const { transaction } = require('../database/connection');
const HttpError = require('../middlewares/httpError');
const { toFeedbackOutput } = require('../dtos/feedbackDto');

// Média com 2 casas decimais (soma * 100 é inteira, então o arredondamento fica exato)
const average = (sum, total) => Math.round((sum * 100) / total) / 100;

module.exports = {
  // Salva o feedback e recalcula a média do projeto na mesma transação
  async create(projectId, input) {
    return transaction(async (client) => {
      // FOR UPDATE: dois feedbacks ao mesmo tempo no mesmo projeto esperam um pelo outro
      const project = await projectRepository.findByIdForUpdate(projectId, client);
      if (!project) throw HttpError.notFound(`Projeto ${projectId} não encontrado`);

      const feedback = await feedbackRepository.create({ projectId, ...input }, client);
      const { total, sum } = await feedbackRepository.statsByProject(projectId, client);
      const averageRating = average(sum, total);
      await projectRepository.updateAverageRating(projectId, averageRating, client);

      return {
        feedback: toFeedbackOutput(feedback),
        project: { id: projectId, averageRating, totalFeedbacks: total },
      };
    });
  },
};
