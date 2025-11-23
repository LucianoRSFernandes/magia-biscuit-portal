const db = require('../database'); // Conexão já configurada com Promise
const cloudinary = require('../cloudinaryConfig');
const fs = require('fs').promises;

// --- LISTAR POSTS ---
exports.listarPosts = async (req, res) => {
  const sql = 'SELECT * FROM posts ORDER BY data_criacao DESC'; // Ajustado nome da coluna data
  try {
    const [results] = await db.query(sql);
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
  console.log('--- CRIAÇÃO DE POST ---');
  const { titulo, conteudo } = req.body;
  let imagem_url = null;
  const filePath = req.file?.path;

  if (!titulo || !conteudo) {
      if (filePath) await fs.unlink(filePath).catch(console.error);
      return res.status(400).json({ message: 'Título e conteúdo são obrigatórios.' });
  }

  try {
    if (req.file) {
      console.log('Enviando imagem post para Cloudinary...');
      const resultadoUpload = await cloudinary.uploader.upload(filePath, { folder: "posts" });
      imagem_url = resultadoUpload.secure_url;
      await fs.unlink(filePath).catch(console.error);
    }

    const sql = 'INSERT INTO posts (titulo, conteudo, imagem_url) VALUES (?, ?, ?)';
    // CORREÇÃO: Removido .promise()
    const [results] = await db.query(sql, [titulo, conteudo, imagem_url]);
    
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
  const { titulo, conteudo, imagem_url_existente } = req.body;
  let imagem_url = imagem_url_existente || null;
  const filePath = req.file?.path;

  if (isNaN(parseInt(id, 10))) {
      if (filePath) await fs.unlink(filePath).catch(console.error);
      return res.status(400).json({ message: 'ID do post inválido.'});
  }
   if (!titulo || !conteudo) {
      if (filePath) await fs.unlink(filePath).catch(console.error);
      return res.status(400).json({ message: 'Título e conteúdo são obrigatórios.' });
  }

  try {
    if (req.file) {
      const resultadoUpload = await cloudinary.uploader.upload(filePath, { folder: "posts" });
      imagem_url = resultadoUpload.secure_url;
      await fs.unlink(filePath).catch(console.error);
      
      // Opcional: Deletar imagem antiga do Cloudinary aqui se desejar
    }

    const sql = 'UPDATE posts SET titulo = ?, conteudo = ?, imagem_url = ? WHERE id = ?';
    // CORREÇÃO: Removido .promise()
    const [results] = await db.query(sql, [titulo, conteudo, imagem_url, id]);

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

   if (isNaN(parseInt(id, 10))) {
      return res.status(400).json({ message: 'ID do post inválido.'});
  }

  const findSql = 'SELECT imagem_url FROM posts WHERE id = ?';
  const deleteSql = 'DELETE FROM posts WHERE id = ?';

  try {
    // 1. Buscar URL da imagem
    const [findResults] = await db.query(findSql, [id]);
    const imagemUrlParaDeletar = findResults.length > 0 ? findResults[0].imagem_url : null;

    // 2. Deletar do banco
    const [deleteResults] = await db.query(deleteSql, [id]);

    if (deleteResults.affectedRows === 0) {
      return res.status(404).json({ message: 'Post não encontrado.' });
    }

    // 3. Deletar do Cloudinary
    if (imagemUrlParaDeletar) {
        // Lógica simples para extrair Public ID
        try {
            const publicId = imagemUrlParaDeletar.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        } catch(e) { console.error("Erro ao deletar imagem post Cloudinary", e); }
    }

    res.json({ message: 'Post deletado com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({ error: 'Erro ao deletar post.' });
  }
};