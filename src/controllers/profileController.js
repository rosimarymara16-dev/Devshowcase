const profileService = require('../services/profileService');

module.exports = {
  async create(req, res) {
    const profile = await profileService.create(req.body);
    res.status(201).location(`/api/profiles/${profile.id}`).json(profile);
  },

  async show(req, res) {
    res.json(await profileService.getById(Number(req.params.id)));
  },
};
