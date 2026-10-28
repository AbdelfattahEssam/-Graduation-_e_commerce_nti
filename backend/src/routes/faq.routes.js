const router = require('express').Router();
const ctrl = require('../controllers/faq.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.get('/', ctrl.getFaqs);

router.use(protect, restrictTo('admin'));
router.post('/', ctrl.createFaq);
router.patch('/:id', ctrl.updateFaq);
router.delete('/:id', ctrl.deleteFaq);

module.exports = router;