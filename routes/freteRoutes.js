const express = require('express');
const router = express.Router();
const freteController = require('../controllers/freteController');

router.post('/calcular', freteController.calcularFrete);

module.exports = router;