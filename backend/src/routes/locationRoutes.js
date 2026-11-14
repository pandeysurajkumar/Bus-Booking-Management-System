const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/states', locationController.getStates);
router.get('/cities', locationController.getCities);
router.get('/stops', locationController.getStops);

module.exports = router;
