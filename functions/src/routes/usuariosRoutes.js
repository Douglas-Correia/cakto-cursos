const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const courseAccessMiddleware = require('../middlewares/courseAccessMiddleware');


router.get('/atual', authMiddleware, usuariosController.getCurrentUser);
router.post('/avaliar', authMiddleware, courseAccessMiddleware, usuariosController.evaluateLesson);

router.post('/acessoAdmin', usuariosController.setAdminPassword);
router.post('/loginAdmin', usuariosController.loginAdmin);

router.post('/loginUser', isAdminMiddleware, usuariosController.loginUser);

router.post('/createUser', isAdminMiddleware, usuariosController.createUser);
router.post('/editUser', isAdminMiddleware, usuariosController.editUser);
router.post('/deleteUser', isAdminMiddleware, usuariosController.deleteUser);

router.post('/addCourseToUser', isAdminMiddleware, usuariosController.addCourseToUser);
router.post('/removeCourseFromUser', isAdminMiddleware, usuariosController.removeCourseFromUser);
router.post('/editUserCourse', isAdminMiddleware, usuariosController.editUserCourse);

module.exports = router;
