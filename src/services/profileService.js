const profileRepository = require('../repositories/profileRepository');
const projectRepository = require('../repositories/projectRepository');
const HttpError = require('../middlewares/httpError');
const { toProfileOutput } = require('../dtos/profileDto');

module.exports = {
  create(input) {
    if (profileRepository.findByEmail(input.email)) {
      throw HttpError.conflict('Já existe um perfil com esse e-mail');
    }
    const profile = profileRepository.create(input);
    return toProfileOutput(profile);
  },

  getById(id) {
    const profile = profileRepository.findById(id);
    if (!profile) throw HttpError.notFound(`Perfil ${id} não encontrado`);
    return toProfileOutput(profile, projectRepository.findByProfile(id));
  },
};
