const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken } = require('../authMiddleware'); // Importe o middleware

// Rotas públicas de cadastro e login de clientes
router.post('/register', clienteController.registrarCliente);
router.post('/login', clienteController.loginCliente);

// Nova rota GET protegida para listar todos os clientes (somente admin)
router.get('/', verificarToken, clienteController.listarClientes);

module.exports = router;