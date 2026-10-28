const router = require('express').Router();
const ctrl = require('../controllers/shippingZone.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.get('/', ctrl.getZones);
router.patch('/:id', protect, restrictTo('admin'), ctrl.updateZone);

module.exports = router;