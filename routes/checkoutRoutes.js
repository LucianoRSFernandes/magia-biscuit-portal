const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { verificarToken } = require('../authMiddleware');

// A rota para criar o checkout deve ser protegida
router.post('/', verificarToken, checkoutController.criarPreferencia);

module.exports = router;