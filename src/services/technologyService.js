const technologyRepository = require('../repositories/technologyRepository');
const HttpError = require('../middlewares/httpError');
const { toTechnologyOutput } = require('../dtos/technologyDto');

module.exports = {
  create(input) {
    if (technologyRepository.findByName(input.name)) {
      throw HttpError.conflict(`A tecnologia "${input.name}" já está cadastrada`);
    }
    return toTechnologyOutput(technologyRepository.create(input));
  },

  list() {
    return technologyRepository.findAll().map(toTechnologyOutput);
  },
};
