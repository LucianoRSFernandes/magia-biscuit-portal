const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para registrar um usuário (potencialmente admin)
// Verifique se você realmente quer permitir o registro de admins via API
router.post('/register', authController.registrarUsuario); 

// Rota de login exclusiva para administradores
router.post('/login', authController.loginAdmin); 

module.exports = router;