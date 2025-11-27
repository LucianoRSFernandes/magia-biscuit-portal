const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const multer = require('multer');

// Configuração simples do Multer para salvar temporariamente antes de enviar ao Cloudinary
// (Isso é necessário porque o controller espera req.file.path)
const upload = multer({ dest: 'uploads/' });

// Middleware de Autenticação (Opcional: Se quiser proteger as rotas de criar/editar)
// const { verificarToken } = require('../authMiddleware'); 
// Se for usar, adicione verificarToken antes do upload.single nas rotas abaixo.

// --- ROTAS PÚBLICAS ---

// Listar todos os posts
router.get('/', postController.listarPosts);

// Pegar um post específico
router.get('/:id', postController.obterPostPorId);


// --- ROTAS PROTEGIDAS (Admin) ---
// Nota: Adicionei o middleware 'upload.single' que estava faltando ou causando erro

// Criar Post (com upload de imagem chamada 'imagem')
router.post('/', upload.single('imagem'), postController.criarPost);

// Atualizar Post (Essa deve ser a linha 16 que estava dando erro)
router.put('/:id', upload.single('imagem'), postController.atualizarPost);

// Deletar Post
router.delete('/:id', postController.deletarPost);

module.exports = router;