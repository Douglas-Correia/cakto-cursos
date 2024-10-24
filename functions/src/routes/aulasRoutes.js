const express = require('express');
const router = express.Router();
const aulasController = require('../controllers/aulasController');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const courseOwnershipMiddleware = require('../middlewares/courseOwnershipMiddleware');
const courseAccessMiddleware = require('../middlewares/courseAccessMiddleware');

router.get('/getFileUrl/:lessonId', authMiddleware, courseAccessMiddleware, aulasController.getFileToken);
router.post('/getVideo', authMiddleware, courseAccessMiddleware, aulasController.getVideoToken);

router.post('/', authMiddleware, courseOwnershipMiddleware, aulasController.createLesson);
router.get('/:lessonId', authMiddleware, courseAccessMiddleware, aulasController.getLessonById);
router.get('/:lessonId/assistir', authMiddleware, courseAccessMiddleware, aulasController.getLessonWatch);
router.put('/:lessonId', authMiddleware, courseOwnershipMiddleware, aulasController.updateLesson);
router.delete('/:lessonId', authMiddleware, courseOwnershipMiddleware, aulasController.deleteLesson);

router.get('/', isAdminMiddleware, aulasController.getAllLessons);

module.exports = router;
