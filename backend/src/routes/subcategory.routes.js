const router = require('express').Router();
const ctrl = require('../controllers/subcategory.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.get('/', ctrl.getSubcategories);

router.use(protect, restrictTo('admin'));
router.get('/admin/all', ctrl.getAllSubcategoriesAdmin);
router.post('/', ctrl.createSubcategory);
router.patch('/:id', ctrl.updateSubcategory);
router.delete('/:id', ctrl.deleteSubcategory);

module.exports = router;