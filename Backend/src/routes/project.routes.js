const router = require('express').Router();
const projectController = require('../controllers/project.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createProjectSchema, updateProjectSchema } = require('../validators/project.validator');

router.get('/', authenticate, projectController.list);
router.post('/', authenticate, authorize('project:create'), validate(createProjectSchema), projectController.create);
router.get('/:id', authenticate, projectController.getById);
router.put('/:id', authenticate, authorize('project:edit'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', authenticate, authorize('project:delete'), projectController.remove);
router.get('/:id/timeline', authenticate, projectController.getTimeline);

module.exports = router;
