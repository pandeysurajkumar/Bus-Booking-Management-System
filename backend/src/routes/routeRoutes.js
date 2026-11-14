const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.get('/', routeController.getRoutes);
router.get('/popular', routeController.getPopularRoutes);
router.post('/', protect, authorize(ROLES.ADMIN), routeController.createRoute);

module.exports = router;
