const router = require('express').Router();
const ctrl = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/validate', ctrl.validateGuestCart);

router.use(protect);
router.get('/', ctrl.getCart);
router.post('/merge', ctrl.mergeCart);
router.post('/items', ctrl.addItem);
router.patch('/items/:productId', ctrl.updateItem);
router.patch('/items/:productId/accept-price', ctrl.acceptNewPrice);
router.delete('/items/:productId', ctrl.removeItem);
router.delete('/', ctrl.clearCart);

module.exports = router;