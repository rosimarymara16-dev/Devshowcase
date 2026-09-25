const projectRepository = require('../repositories/projectRepository');
const profileRepository = require('../repositories/profileRepository');
const technologyRepository = require('../repositories/technologyRepository');
const feedbackRepository = require('../repositories/feedbackRepository');
const { transaction } = require('../database/connection');
const HttpError = require('../middlewares/httpError');
const { toProjectOutput } = require('../dtos/projectDto');

// Monta o DTO de saída completo (dono, tecnologias e feedbacks)
const present = async (project) => {
  const [profile, technologies, feedbacks] = await Promise.all([
    profileRepository.findById(project.profile_id),
    technologyRepository.findByProject(project.id),
    feedbackRepository.findByProject(project.id),
  ]);
  return toProjectOutput(project, { profile, technologies, feedbacks });
};

module.exports = {
  async create({ technologyIds, ...data }) {
    if (!(await profileRepository.findById(data.profileId))) {
      throw HttpError.notFound(`Perfil ${data.profileId} não encontrado`);
    }

    const uniqueIds = [...new Set(technologyIds)];
    const found = (await technologyRepository.findByIds(uniqueIds)).map((t) => t.id);
    const missing = uniqueIds.filter((id) => !found.includes(id));
    if (missing.length) {
      throw HttpError.badRequest('Tecnologia(s) não encontrada(s)', [
        { field: 'technologyIds', message: `ids inexistentes: ${missing.join(', ')}` },
      ]);
    }

    // Projeto + vínculos com tecnologias são gravados na mesma transação
    const project = await transaction(async (client) => {
      const created = await projectRepository.create(data, client);
      await projectRepository.linkTechnologies(created.id, uniqueIds, client);
      return created;
    });
    return present(project);
  },

  async list({ technology, page, limit }) {
    const filter = { technology: technology || undefined };
    const [rows, totalItems] = await Promise.all([
      projectRepository.findPage({ ...filter, limit, offset: (page - 1) * limit }),
      projectRepository.count(filter),
    ]);
    return {
      data: await Promise.all(rows.map(present)),
      pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  },

  async upvote(id) {
    const project = await projectRepository.incrementUpvotes(id);
    if (!project) throw HttpError.notFound(`Projeto ${id} não encontrado`);
    return present(project);
  },
};
