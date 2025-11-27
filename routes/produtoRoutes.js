const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const multer = require('multer');

// Configuração do Multer
const upload = multer({ dest: 'uploads/' });

// Rotas
router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.obterProdutoPorId);

// Rotas de Escrita (Upload de imagem 'imagem')
router.post('/', upload.single('imagem'), produtoController.criarProduto);
router.put('/:id', upload.single('imagem'), produtoController.atualizarProduto);
router.delete('/:id', produtoController.deletarProduto);

module.exports = router;