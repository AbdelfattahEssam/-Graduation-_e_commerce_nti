const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const { protect,restrictTo } = require('../middlewares/auth.middleware');

router.use(protect);
router.post('/', ctrl.createOrder);
router.get('/my', ctrl.getMyOrders);
router.get('/my/:id', ctrl.getMyOrder);
router.patch('/my/:id/cancel', ctrl.cancelMyOrder);
router.get('/', restrictTo('admin'), ctrl.getAllOrders);
router.patch('/:id/status', restrictTo('admin'), ctrl.updateOrderStatus);

module.exports = router;