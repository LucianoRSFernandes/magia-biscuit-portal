// controllers/produtoController.js (Bloco Original Refatorado)

const connection = require('../database');
const cloudinary = require('../cloudinaryConfig');
const fs = require('fs').promises; // Para deletar arquivos temporários

// Função auxiliar para deletar arquivo temporário
const deleteTempFile = async (filePath) => {
    if (filePath) {
        try {
            await fs.unlink(filePath);
            console.log("Arquivo temporário deletado:", filePath);
        } catch (err) {
            console.error("Erro ao deletar arquivo temporário:", filePath, err);
        }
    }
};

// Função auxiliar para deletar imagem do Cloudinary
const deleteCloudinaryImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return; // Verifica se é uma URL do Cloudinary
    try {
        const publicIdWithExtension = imageUrl.split('/').pop();
        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
        if (publicId) {
            const result = await cloudinary.uploader.destroy(publicId);
            console.log("Resultado da deleção no Cloudinary:", result);
        }
    } catch (err) {
        console.error("Erro ao deletar imagem do Cloudinary:", imageUrl, err);
    }
};


// Função para LISTAR todos os produtos - Convertida para Async/Await
exports.listarProdutos = async (req, res) => {
  const sql = 'SELECT * FROM produtos ORDER BY id DESC'; // Ordena por ID decrescente (mais novos primeiro)
  try {
    const [results] = await connection.promise().query(sql);
    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do banco de dados' });
  }
};

// Função para BUSCAR um único produto pelo ID - Convertida para Async/Await
exports.obterProdutoPorId = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) {
      return res.status(400).json({ message: 'ID do produto inválido.'});
  }
  const sql = 'SELECT * FROM produtos WHERE id = ?';
  try {
    const [results] = await connection.promise().query(sql, [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do banco de dados' });
  }
};

// Função para CRIAR um novo produto - Refatorada
exports.criarProduto = async (req, res) => {
  console.log('--- INICIANDO CRIAÇÃO DE PRODUTO ---');
  const { nome, descricao, preco, categoria } = req.body;
  const file = req.file;
  let imagem_url = null;

  // Validação de Entrada
  if (!nome || !descricao || !preco) {
      await deleteTempFile(file?.path);
      return res.status(400).json({ message: 'Nome, descrição e preço são obrigatórios.' });
  }
  if (isNaN(parseFloat(preco))) {
      await deleteTempFile(file?.path);
      return res.status(400).json({ message: 'Preço inválido.' });
  }
  if (!file) { // Imagem é obrigatória ao criar
       return res.status(400).json({ message: 'Imagem do produto é obrigatória.' });
  }

  try {
    console.log('Arquivo recebido! Enviando para o Cloudinary...');
    const resultadoUpload = await cloudinary.uploader.upload(file.path, {
        folder: "produtos", // Organiza em pasta
    });
    imagem_url = resultadoUpload.secure_url;
    console.log('Upload para Cloudinary concluído! URL:', imagem_url);
    await deleteTempFile(file.path);

    const sql = 'INSERT INTO produtos (nome, descricao, preco, imagem_url, categoria) VALUES (?, ?, ?, ?, ?)';
    const [results] = await connection.promise().query(sql, [nome, descricao, parseFloat(preco), imagem_url, categoria || null]); // Garante número e trata categoria opcional
    res.status(201).json({ message: 'Produto criado com sucesso!', id: results.insertId });

  } catch (error) {
    console.error('Erro no upload da imagem ou ao criar produto:', error);
    await deleteTempFile(file?.path);
    const errorMessage = error.message || 'Falha ao processar a requisição.';
    res.status(500).json({ error: errorMessage });
  }
};

// Função para ATUALIZAR um produto - Refatorada
exports.atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, categoria, imagem_url_existente } = req.body;
  const file = req.file;
  let imagem_url = imagem_url_existente || null;
  let imagemAntigaParaDeletar = null;

  // Validação
  if (isNaN(parseInt(id, 10))) {
      await deleteTempFile(file?.path);
      return res.status(400).json({ message: 'ID do produto inválido.'});
  }
   if (!nome || !descricao || !preco) {
      await deleteTempFile(file?.path);
      return res.status(400).json({ message: 'Nome, descrição e preço são obrigatórios.' });
  }
   if (isNaN(parseFloat(preco))) {
      await deleteTempFile(file?.path);
      return res.status(400).json({ message: 'Preço inválido.' });
  }

  try {
    if (file) {
      console.log('Novo arquivo recebido! Enviando para o Cloudinary...');
      const resultadoUpload = await cloudinary.uploader.upload(file.path, { folder: "produtos" });
      imagem_url = resultadoUpload.secure_url;
      console.log('Upload concluído! Nova URL:', imagem_url);
      await deleteTempFile(file.path);
      imagemAntigaParaDeletar = imagem_url_existente; // Guarda URL antiga para deletar
    } else {
      console.log('Nenhum NOVO arquivo de imagem enviado.');
    }

    const sql = 'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, imagem_url = ?, categoria = ? WHERE id = ?';
    const [results] = await connection.promise().query(sql, [nome, descricao, parseFloat(preco), imagem_url, categoria || null, id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    // Deleta a imagem antiga do Cloudinary APÓS sucesso na atualização do DB
    if (imagemAntigaParaDeletar) {
        await deleteCloudinaryImage(imagemAntigaParaDeletar);
    }

    res.json({ message: 'Produto atualizado com sucesso!' });

  } catch (error) {
    console.error('Erro no upload da imagem ou ao atualizar produto:', error);
    await deleteTempFile(file?.path);
    const errorMessage = error.message || 'Falha ao processar a requisição.';
    res.status(500).json({ error: errorMessage });
  }
};

// Função para DELETAR um produto - Refatorada
exports.deletarProduto = async (req, res) => {
  const { id } = req.params;

   if (isNaN(parseInt(id, 10))) {
      return res.status(400).json({ message: 'ID do produto inválido.'});
  }

  const findSql = 'SELECT imagem_url FROM produtos WHERE id = ?';
  const deleteSql = 'DELETE FROM produtos WHERE id = ?';

  try {
    // Buscar URL da imagem antes de deletar
    const [findResults] = await connection.promise().query(findSql, [id]);
    const imagemUrlParaDeletar = findResults.length > 0 ? findResults[0].imagem_url : null;

    // Deletar o produto do banco
    const [deleteResults] = await connection.promise().query(deleteSql, [id]);

    if (deleteResults.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    // Deletar a imagem do Cloudinary se ela existia
    if (imagemUrlParaDeletar) {
        await deleteCloudinaryImage(imagemUrlParaDeletar);
    }

    res.json({ message: 'Produto deletado com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro ao deletar dados do banco de dados' });
  }
};