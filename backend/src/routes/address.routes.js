const router = require('express').Router();
const ctrl = require('../controllers/address.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/', ctrl.getAddresses);
router.post('/', ctrl.addAddress);
router.patch('/:id', ctrl.updateAddress);
router.patch('/:id/default', ctrl.setDefault);
router.delete('/:id', ctrl.deleteAddress);

module.exports = router;