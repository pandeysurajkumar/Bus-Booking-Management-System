const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.get('/', busController.getBuses);
router.get('/:id', busController.getBusById);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.OPERATOR), busController.createBus);

module.exports = router;
