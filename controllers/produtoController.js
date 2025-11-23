const db = require('../database'); // Conexão já configurada com Promise
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
    if (!imageUrl || !imageUrl.includes('cloudinary')) return;
    try {
        const publicIdWithExtension = imageUrl.split('/').pop();
        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
        if (publicId) {
            const result = await cloudinary.uploader.destroy(publicId); // Note: pasta/publicId se usar pastas
            console.log("Resultado da deleção no Cloudinary:", result);
        }
    } catch (err) {
        console.error("Erro ao deletar imagem do Cloudinary:", imageUrl, err);
    }
};

// --- LISTAR PRODUTOS ---
exports.listarProdutos = async (req, res) => {
  const sql = 'SELECT * FROM produtos ORDER BY id DESC';
  try {
    // CORREÇÃO: Removido .promise()
    const [results] = await db.query(sql);
    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do banco de dados' });
  }
};

// --- BUSCAR PRODUTO POR ID ---
exports.obterProdutoPorId = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) {
      return res.status(400).json({ message: 'ID do produto inválido.'});
  }
  const sql = 'SELECT * FROM produtos WHERE id = ?';
  try {
    const [results] = await db.query(sql, [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do banco de dados' });
  }
};

// --- CRIAR PRODUTO ---
exports.criarProduto = async (req, res) => {
  console.log('--- INICIANDO CRIAÇÃO DE PRODUTO ---');
  const { nome, descricao, preco, categoria } = req.body;
  const file = req.file;
  let imagem_url = null;

  // Validação
  if (!nome || !descricao || !preco) {
      await deleteTempFile(file?.path);
      return res.status(400).json({ message: 'Nome, descrição e preço são obrigatórios.' });
  }
  if (isNaN(parseFloat(preco))) {
      await deleteTempFile(file?.path);
      return res.status(400).json({ message: 'Preço inválido.' });
  }
  if (!file) {
       return res.status(400).json({ message: 'Imagem do produto é obrigatória.' });
  }

  try {
    console.log('Enviando imagem para Cloudinary...');
    const resultadoUpload = await cloudinary.uploader.upload(file.path, {
        folder: "produtos",
    });
    imagem_url = resultadoUpload.secure_url;
    console.log('Upload concluído! URL:', imagem_url);
    await deleteTempFile(file.path);

    const sql = 'INSERT INTO produtos (nome, descricao, preco, imagem_url, categoria) VALUES (?, ?, ?, ?, ?)';
    // CORREÇÃO: Removido .promise()
    const [results] = await db.query(sql, [nome, descricao, parseFloat(preco), imagem_url, categoria || null]);
    
    res.status(201).json({ message: 'Produto criado com sucesso!', id: results.insertId });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    await deleteTempFile(file?.path);
    res.status(500).json({ error: error.message || 'Falha ao processar a requisição.' });
  }
};

// --- ATUALIZAR PRODUTO ---
exports.atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, categoria, imagem_url_existente } = req.body;
  const file = req.file;
  let imagem_url = imagem_url_existente || null;
  let imagemAntigaParaDeletar = null;

  if (isNaN(parseInt(id, 10))) {
      await deleteTempFile(file?.path);
      return res.status(400).json({ message: 'ID do produto inválido.'});
  }
   if (!nome || !descricao || !preco) {
      await deleteTempFile(file?.path);
      return res.status(400).json({ message: 'Nome, descrição e preço são obrigatórios.' });
  }

  try {
    if (file) {
      console.log('Atualizando imagem no Cloudinary...');
      const resultadoUpload = await cloudinary.uploader.upload(file.path, { folder: "produtos" });
      imagem_url = resultadoUpload.secure_url;
      await deleteTempFile(file.path);
      imagemAntigaParaDeletar = imagem_url_existente;
    }

    const sql = 'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, imagem_url = ?, categoria = ? WHERE id = ?';
    // CORREÇÃO: Removido .promise()
    const [results] = await db.query(sql, [nome, descricao, parseFloat(preco), imagem_url, categoria || null, id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    if (imagemAntigaParaDeletar) {
        await deleteCloudinaryImage(imagemAntigaParaDeletar);
    }

    res.json({ message: 'Produto atualizado com sucesso!' });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    await deleteTempFile(file?.path);
    res.status(500).json({ error: error.message || 'Falha ao atualizar produto.' });
  }
};

// --- DELETAR PRODUTO ---
exports.deletarProduto = async (req, res) => {
  const { id } = req.params;

   if (isNaN(parseInt(id, 10))) {
      return res.status(400).json({ message: 'ID do produto inválido.'});
  }

  const findSql = 'SELECT imagem_url FROM produtos WHERE id = ?';
  const deleteSql = 'DELETE FROM produtos WHERE id = ?';

  try {
    // 1. Buscar URL da imagem
    const [findResults] = await db.query(findSql, [id]);
    const imagemUrlParaDeletar = findResults.length > 0 ? findResults[0].imagem_url : null;

    // 2. Deletar do banco
    const [deleteResults] = await db.query(deleteSql, [id]);

    if (deleteResults.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    // 3. Deletar do Cloudinary
    if (imagemUrlParaDeletar) {
        await deleteCloudinaryImage(imagemUrlParaDeletar);
    }

    res.json({ message: 'Produto deletado com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro ao deletar produto.' });
  }
};

// --- LIMPAR CARRINHO (Novo!) ---
// Nota: Em arquitetura REST sem sessão no servidor, o carrinho geralmente fica no Frontend (localStorage).
// Se o carrinho for salvo no banco de dados, use a função abaixo.
exports.limparCarrinho = async (req, res) => {
    // Exemplo: Se tiver uma tabela 'carrinho_itens' ligada ao usuário
    // const userId = req.usuario.id; 
    // const sql = 'DELETE FROM carrinho_itens WHERE usuario_id = ?';
    
    // Como seu projeto atual usa carrinho no LocalStorage do React, 
    // essa ação deve ser feita no Front-end (CartPage.jsx -> clearCart()).
    // Mas deixo o esqueleto aqui caso evolua para banco de dados.
    res.json({ message: 'Carrinho limpo com sucesso (Lógica deve ser implementada no Frontend para LocalStorage).' });
};