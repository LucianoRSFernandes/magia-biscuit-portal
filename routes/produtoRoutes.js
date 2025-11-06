const express = require('express');
const router = express.Router();
const multer = require('multer');
const produtoController = require('../controllers/produtoController');
const { verificarToken } = require('../authMiddleware');

// Configure o multer para salvar os arquivos temporariamente na pasta 'uploads'
const upload = multer({ dest: 'uploads/' });

// Rotas públicas para visualização
router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.obterProdutoPorId);

// Rota POST para criar um produto, agora com o middleware do multer
// O 'upload.single('imagem')' irá processar o arquivo e os campos de texto
router.post('/', verificarToken, upload.single('imagem'), produtoController.criarProduto);

// Rotas protegidas para atualizar e deletar
router.put('/:id', verificarToken, upload.single('imagem'), produtoController.atualizarProduto);
router.delete('/:id', verificarToken, produtoController.deletarProduto);

module.exports = router;