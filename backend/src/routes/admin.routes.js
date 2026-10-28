const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.use(protect, restrictTo('admin'));
router.get('/stats', ctrl.getStats);+
router.post('/admins', ctrl.createAdmin);
router.get('/users', ctrl.getUsers);
router.patch('/users/:id/block', ctrl.setBlocked);

module.exports = router;