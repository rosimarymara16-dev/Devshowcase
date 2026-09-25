const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validateBody = require('../middlewares/validateBody');
const validateQuery = require('../middlewares/validateQuery');
const validateId = require('../middlewares/validateId');

const profileController = require('../controllers/profileController');
const technologyController = require('../controllers/technologyController');
const projectController = require('../controllers/projectController');
const feedbackController = require('../controllers/feedbackController');

const { CreateProfileInput } = require('../dtos/profileDto');
const { CreateTechnologyInput } = require('../dtos/technologyDto');
const { CreateProjectInput, ListProjectsQuery } = require('../dtos/projectDto');
const { CreateFeedbackInput } = require('../dtos/feedbackDto');

const router = Router();

// Toda rota com :id só aceita inteiro positivo (senão responde 400)
router.param('id', validateId);

router.post('/profiles', validateBody(CreateProfileInput), asyncHandler(profileController.create));
router.get('/profiles/:id', asyncHandler(profileController.show));

router.post('/technologies', validateBody(CreateTechnologyInput), asyncHandler(technologyController.create));
router.get('/technologies', asyncHandler(technologyController.index));

router.post('/projects', validateBody(CreateProjectInput), asyncHandler(projectController.create));
router.get('/projects', validateQuery(ListProjectsQuery), asyncHandler(projectController.index));
router.put('/projects/:id/upvote', asyncHandler(projectController.upvote));
router.post('/projects/:id/feedbacks', validateBody(CreateFeedbackInput), asyncHandler(feedbackController.create));

module.exports = router;
