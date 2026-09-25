const projectRepository = require('../repositories/projectRepository');
const profileRepository = require('../repositories/profileRepository');
const technologyRepository = require('../repositories/technologyRepository');
const feedbackRepository = require('../repositories/feedbackRepository');
const HttpError = require('../middlewares/httpError');
const { toProjectOutput } = require('../dtos/projectDto');

// Monta o DTO de saída completo (dono, tecnologias e feedbacks)
const present = (project) =>
  toProjectOutput(project, {
    profile: profileRepository.findById(project.profile_id),
    technologies: technologyRepository.findByProject(project.id),
    feedbacks: feedbackRepository.findByProject(project.id),
  });

module.exports = {
  create({ technologyIds, ...data }) {
    if (!profileRepository.findById(data.profileId)) {
      throw HttpError.notFound(`Perfil ${data.profileId} não encontrado`);
    }

    const uniqueIds = [...new Set(technologyIds)];
    const found = technologyRepository.findByIds(uniqueIds).map((t) => t.id);
    const missing = uniqueIds.filter((id) => !found.includes(id));
    if (missing.length) {
      throw HttpError.badRequest('Tecnologia(s) não encontrada(s)', [
        { field: 'technologyIds', message: `ids inexistentes: ${missing.join(', ')}` },
      ]);
    }

    const project = projectRepository.create(data, uniqueIds);
    return present(project);
  },

  list() {
    return projectRepository.findAll().map(present);
  },
};
