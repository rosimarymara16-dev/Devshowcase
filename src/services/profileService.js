const profileRepository = require('../repositories/profileRepository');
const projectRepository = require('../repositories/projectRepository');
const HttpError = require('../middlewares/httpError');
const { toProfileOutput } = require('../dtos/profileDto');

module.exports = {
  async create(input) {
    if (await profileRepository.findByEmail(input.email)) {
      throw HttpError.conflict('Já existe um perfil com esse e-mail');
    }
    const profile = await profileRepository.create(input);
    return toProfileOutput(profile);
  },

  async getById(id) {
    const profile = await profileRepository.findById(id);
    if (!profile) throw HttpError.notFound(`Perfil ${id} não encontrado`);
    return toProfileOutput(profile, await projectRepository.findByProfile(id));
  },
};
