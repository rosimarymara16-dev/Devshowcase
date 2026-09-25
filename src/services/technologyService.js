const technologyRepository = require('../repositories/technologyRepository');
const HttpError = require('../middlewares/httpError');
const { toTechnologyOutput } = require('../dtos/technologyDto');

module.exports = {
  async create(input) {
    if (await technologyRepository.findByName(input.name)) {
      throw HttpError.conflict('Já existe uma tecnologia com esse nome');
    }
    return toTechnologyOutput(await technologyRepository.create(input));
  },

  async list() {
    return (await technologyRepository.findAll()).map(toTechnologyOutput);
  },
};
