const db = require('../database');
const cloudinary = require('../cloudinaryConfig');
const fs = require('fs').promises;

exports.listarPosts = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM posts ORDER BY data_criacao DESC');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar posts' });
  }
};

exports.obterPostPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Post não encontrado' });
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.criarPost = async (req, res) => {
  const { titulo, conteudo } = req.body;
  let imagem = null; // Nome corrigido
  const filePath = req.file?.path;

  if (!titulo || !conteudo) {
      if (filePath) await fs.unlink(filePath).catch(console.error);
      return res.status(400).json({ message: 'Dados incompletos' });
  }

  try {
    if (req.file) {
      const result = await cloudinary.uploader.upload(filePath, { folder: "posts" });
      imagem = result.secure_url;
      await fs.unlink(filePath).catch(console.error);
    }

    const sql = 'INSERT INTO posts (titulo, conteudo, imagem) VALUES (?, ?, ?)';
    const [results] = await db.query(sql, [titulo, conteudo, imagem]);
    
    res.status(201).json({ message: 'Post criado!', id: results.insertId });

  } catch (error) {
    console.error(error);
    if (filePath) await fs.unlink(filePath).catch(console.error);
    res.status(500).json({ error: error.message });
  }
};

exports.atualizarProduto = async (req, res) => {
  const { id } = req.params;
  // Nota: O frontend deve enviar o nome do campo antigo como 'imagem_existente' ou similar
  const { nome, descricao, preco, categoria, imagem_existente } = req.body; 
  const file = req.file;
  let imagem = imagem_existente || null; // Nome corrigido
  let imagemAntiga = null;

  if (isNaN(parseInt(id, 10))) {
      await deleteTempFile(file?.path);
      return res.status(400).json({ message: 'ID inválido.'});
  }

  try {
    if (file) {
      const result = await cloudinary.uploader.upload(file.path, { folder: "produtos" });
      imagem = result.secure_url;
      await deleteTempFile(file.path);
      imagemAntiga = imagem_existente;
    }

    const sql = 'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, imagem = ?, categoria = ? WHERE id = ?';
    const [results] = await db.query(sql, [nome, descricao, parseFloat(preco), imagem, categoria || null, id]);

    if (results.affectedRows === 0) return res.status(404).json({ message: 'Produto não encontrado.' });

    if (imagemAntiga) await deleteCloudinaryImage(imagemAntiga);

    res.json({ message: 'Produto atualizado!' });

  } catch (error) {
    console.error('Erro ao atualizar:', error);
    await deleteTempFile(file?.path);
    res.status(500).json({ error: error.message });
  }
};

exports.deletarProduto = async (req, res) => {
  const { id } = req.params;
  try {
    // CORREÇÃO: Mudado de imagem_url para imagem
    const [find] = await db.query('SELECT imagem FROM produtos WHERE id = ?', [id]);
    const imgToDelete = find.length > 0 ? find[0].imagem : null;

    const [del] = await db.query('DELETE FROM produtos WHERE id = ?', [id]);

    if (del.affectedRows === 0) return res.status(404).json({ message: 'Produto não encontrado.' });

    if (imgToDelete) await deleteCloudinaryImage(imgToDelete);

    res.json({ message: 'Produto deletado!' });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};