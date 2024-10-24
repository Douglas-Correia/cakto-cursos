const express = require('express');
const router = express.Router();
const cursosController = require('../controllers/cursosController');
const getCoursesController = require('../controllers/getCoursesController');
const authMiddleware = require('../middlewares/authMiddleware');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');
const courseOwnershipMiddleware = require('../middlewares/courseOwnershipMiddleware');
const courseAccessMiddleware = require('../middlewares/courseAccessMiddleware');

router.get('/:cursoId', authMiddleware, courseAccessMiddleware, getCoursesController.getCourseById);
router.get('/', authMiddleware, cursosController.getAllCourses);

router.post('/', authMiddleware, cursosController.createCourse);
router.put('/:cursoId', authMiddleware, courseOwnershipMiddleware, cursosController.updateCourse);
router.delete('/:cursoId', isAdminMiddleware, courseOwnershipMiddleware, cursosController.deleteCourse);

router.get('/:cursoId/users', authMiddleware, courseOwnershipMiddleware, cursosController.listCourseUsers);

router.post('/:cursoId/modulos', authMiddleware, courseOwnershipMiddleware, cursosController.addModulesToCourse);
router.put('/:cursoId/modulos', authMiddleware, courseOwnershipMiddleware, cursosController.updateCourseModules);
router.delete('/:cursoId/modulos', authMiddleware, courseOwnershipMiddleware, cursosController.removeModulesFromCourse);


module.exports = router;
