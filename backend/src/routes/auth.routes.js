const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', protect, auth.getMe);
router.patch('/me', protect, auth.updateMe);

module.exports = router;