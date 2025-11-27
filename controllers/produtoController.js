const db = require('../database');
const cloudinary = require('../cloudinaryConfig');
const fs = require('fs').promises;

const deleteTempFile = async (filePath) => {
    if (filePath) {
        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.error("Erro ao deletar arquivo temporário:", filePath, err);
        }
    }
};

const deleteCloudinaryImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return;
    try {
        const publicIdWithExtension = imageUrl.split('/').pop();
        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
        if (publicId) {
            // Ajuste se usar pastas no cloudinary: 'produtos/publicId'
            await cloudinary.uploader.destroy(publicId); 
        }
    } catch (err) {
        console.error("Erro ao deletar imagem do Cloudinary:", imageUrl, err);
    }
};

exports.listarProdutos = async (req, res) => {
  const sql = 'SELECT * FROM produtos ORDER BY id DESC';
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do banco de dados' });
  }
};

exports.obterProdutoPorId = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) return res.status(400).json({ message: 'ID inválido.'});
  
  try {
    const [results] = await db.query('SELECT * FROM produtos WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Produto não encontrado.' });
    res.json(results[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.criarProduto = async (req, res) => {
  const { nome, descricao, preco, categoria } = req.body;
  const file = req.file;
  let imagem = null; // Nome corrigido

  if (!nome || !descricao || !preco) {
      await deleteTempFile(file?.path);
      return res.status(400).json({ message: 'Dados obrigatórios faltando.' });
  }

  try {
    if (file) {
        console.log('Enviando imagem para Cloudinary...');
        const result = await cloudinary.uploader.upload(file.path, { folder: "produtos" });
        imagem = result.secure_url; // Nome corrigido
        await deleteTempFile(file.path);
    } else {
        return res.status(400).json({ message: 'Imagem obrigatória.' });
    }

    const sql = 'INSERT INTO produtos (nome, descricao, preco, imagem, categoria) VALUES (?, ?, ?, ?, ?)';
    const [results] = await db.query(sql, [nome, descricao, parseFloat(preco), imagem, categoria || null]);
    
    res.status(201).json({ message: 'Produto criado!', id: results.insertId });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    await deleteTempFile(file?.path);
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
