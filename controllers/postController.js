const db = require('../database');
const cloudinary = require('../cloudinaryConfig');
const fs = require('fs').promises;

// --- LISTAR POSTS ---
exports.listarPosts = async (req, res) => {
  // Correção: tabela 'posts' em vez de 'posts_blog'
  const sql = 'SELECT * FROM posts ORDER BY data_criacao DESC'; 
  try {
    const [results] = await db.query(sql); // Sem .promise()
    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do banco de dados' });
  }
};

// --- BUSCAR POST POR ID ---
exports.obterPostPorId = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) {
      return res.status(400).json({ message: 'ID do post inválido.'});
  }
  const sql = 'SELECT * FROM posts WHERE id = ?';
  try {
    const [results] = await db.query(sql, [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Post não encontrado.' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Erro ao buscar post por ID:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do banco de dados' });
  }
};

// --- CRIAR POST ---
exports.criarPost = async (req, res) => {
  const { titulo, conteudo } = req.body;
  let imagem = null;
  const filePath = req.file?.path;

  if (!titulo || !conteudo) {
      if (filePath) await fs.unlink(filePath).catch(console.error);
      return res.status(400).json({ message: 'Título e conteúdo são obrigatórios.' });
  }

  try {
    if (req.file) {
      const result = await cloudinary.uploader.upload(filePath, { folder: "posts" });
      imagem = result.secure_url;
      await fs.unlink(filePath).catch(console.error);
    }

    // Correção: tabela 'posts', coluna 'imagem'
    const sql = 'INSERT INTO posts (titulo, conteudo, imagem) VALUES (?, ?, ?)';
    const [results] = await db.query(sql, [titulo, conteudo, imagem]);
    
    res.status(201).json({ message: 'Post criado com sucesso!', id: results.insertId });

  } catch (error) {
    console.error('Erro ao criar post:', error);
    if (filePath) await fs.unlink(filePath).catch(console.error);
    res.status(500).json({ error: error.message || 'Falha ao criar post.' });
  }
};

// --- ATUALIZAR POST ---
exports.atualizarPost = async (req, res) => {
  const { id } = req.params;
  const { titulo, conteudo, imagem_existente } = req.body;
  let imagem = imagem_existente || null;
  const filePath = req.file?.path;

  if (isNaN(parseInt(id, 10))) {
      if (filePath) await fs.unlink(filePath).catch(console.error);
      return res.status(400).json({ message: 'ID do post inválido.'});
  }

  try {
    if (req.file) {
      const result = await cloudinary.uploader.upload(filePath, { folder: "posts" });
      imagem = result.secure_url;
      await fs.unlink(filePath).catch(console.error);
    }

    const sql = 'UPDATE posts SET titulo = ?, conteudo = ?, imagem = ? WHERE id = ?';
    const [results] = await db.query(sql, [titulo, conteudo, imagem, id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Post não encontrado.' });
    }
    res.json({ message: 'Post atualizado com sucesso!' });

  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    if (filePath) await fs.unlink(filePath).catch(console.error);
    res.status(500).json({ error: error.message || 'Falha ao atualizar post.' });
  }
};

// --- DELETAR POST ---
exports.deletarPost = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Buscar URL da imagem para deletar do Cloudinary
    const [findResults] = await db.query('SELECT imagem FROM posts WHERE id = ?', [id]);
    const imgToDelete = findResults.length > 0 ? findResults[0].imagem : null;

    // 2. Deletar do banco
    const [deleteResults] = await db.query('DELETE FROM posts WHERE id = ?', [id]);

    if (deleteResults.affectedRows === 0) {
      return res.status(404).json({ message: 'Post não encontrado.' });
    }

    // 3. Deletar do Cloudinary
    if (imgToDelete && imgToDelete.includes('cloudinary')) {
        try {
            const publicId = imgToDelete.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId); // Adicione pasta/publicId se necessário
        } catch(e) { console.error("Erro ao deletar img cloudinary", e); }
    }

    res.json({ message: 'Post deletado com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({ error: 'Erro ao deletar post.' });
  }
};