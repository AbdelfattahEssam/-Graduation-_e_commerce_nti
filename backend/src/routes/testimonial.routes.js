const router = require('express').Router();
const ctrl = require('../controllers/testimonial.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.get('/', ctrl.getApproved);
router.post('/', protect, ctrl.createTestimonial);

router.get('/admin/all', protect, restrictTo('admin'), ctrl.getAllAdmin);
router.patch('/:id/status', protect, restrictTo('admin'), ctrl.updateStatus);

module.exports = router;