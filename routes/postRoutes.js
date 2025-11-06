const express = require('express');
const router = express.Router();
const multer = require('multer'); // 1. Importe multer
const postController = require('../controllers/postController');
const { verificarToken } = require('../authMiddleware');

// 2. Configure o multer (mesma configuração dos produtos)
const upload = multer({ dest: 'uploads/' });

// Rotas públicas
router.get('/', postController.listarPosts);
router.get('/:id', postController.obterPostPorId);

// Rotas protegidas com upload
router.post('/', verificarToken, upload.single('imagem'), postController.criarPost); // 3. Adicione upload
router.put('/:id', verificarToken, upload.single('imagem'), postController.atualizarPost); // 4. Adicione upload
router.delete('/:id', verificarToken, postController.deletarPost);

module.exports = router;