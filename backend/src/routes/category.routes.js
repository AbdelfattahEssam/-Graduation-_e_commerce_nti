const router = require('express').Router();
const ctrl = require('../controllers/category.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.get('/', ctrl.getCategories);

router.use(protect, restrictTo('admin'));
router.get('/admin/all', ctrl.getAllCategoriesAdmin);
router.post('/', ctrl.createCategory);
router.patch('/:id', ctrl.updateCategory);
router.delete('/:id', ctrl.deleteCategory);

module.exports = router;