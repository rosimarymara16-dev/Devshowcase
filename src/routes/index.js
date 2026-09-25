const { Router } = require('express');
const validateBody = require('../middlewares/validateBody');

const profileController = require('../controllers/profileController');
const technologyController = require('../controllers/technologyController');
const projectController = require('../controllers/projectController');

const { CreateProfileInput } = require('../dtos/profileDto');
const { CreateTechnologyInput } = require('../dtos/technologyDto');
const { CreateProjectInput } = require('../dtos/projectDto');

const router = Router();

router.post('/profiles', validateBody(CreateProfileInput), profileController.create);
router.get('/profiles/:id', profileController.show);

router.post('/technologies', validateBody(CreateTechnologyInput), technologyController.create);
router.get('/technologies', technologyController.index);

router.post('/projects', validateBody(CreateProjectInput), projectController.create);
router.get('/projects', projectController.index);

module.exports = router;
