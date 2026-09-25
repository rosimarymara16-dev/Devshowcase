const profileService = require('../services/profileService');
const HttpError = require('../middlewares/httpError');

module.exports = {
  create(req, res) {
    const profile = profileService.create(req.body);
    res.status(201).location(`/api/profiles/${profile.id}`).json(profile);
  },

  show(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('O id deve ser um número inteiro positivo');
    res.json(profileService.getById(id));
  },
};
