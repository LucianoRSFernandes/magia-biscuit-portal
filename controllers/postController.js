// controllers/postController.js (Bloco Original Refatorado)

const connection = require('../database');
const cloudinary = require('../cloudinaryConfig');
const fs = require('fs').promises; // Módulo 'fs' para interagir com o sistema de arquivos (usado para deletar o temp file)

// Função para LISTAR todos os posts (pública) - Convertida para Async/Await
exports.listarPosts = async (req, res) => {
  const sql = 'SELECT * FROM posts_blog ORDER BY data_publicacao DESC';
  try {
    const [results] = await connection.promise().query(sql);
    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).send('Erro ao buscar dados do banco de dados');
  }
};

// Função para BUSCAR um único post pelo ID (pública) - Convertida para Async/Await
exports.obterPostPorId = async (req, res) => {
  const { id } = req.params;
  // Validação do ID
  if (isNaN(parseInt(id, 10))) {
      return res.status(400).json({ message: 'ID do post inválido.'});
  }
  const sql = 'SELECT * FROM posts_blog WHERE id = ?';
  try {
    const [results] = await connection.promise().query(sql, [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Post não encontrado.' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Erro ao buscar post por ID:', error);
    res.status(500).send('Erro ao buscar dados do banco de dados');
  }
};

// Função para CRIAR um novo post (protegida, com upload opcional)
exports.criarPost = async (req, res) => {
  console.log('--- INICIANDO CRIAÇÃO DE POST ---');
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);

  const { titulo, conteudo } = req.body;
  let imagem_url = null;
  const filePath = req.file?.path; // Guarda o caminho do arquivo temporário

  // 1. Validação de Entrada
  if (!titulo || !conteudo) {
      // Limpa arquivo temporário se a validação falhar
      if (filePath) await fs.unlink(filePath).catch(err => console.error("Erro ao limpar arquivo temp em criarPost:", err));
      return res.status(400).json({ message: 'Título e conteúdo são obrigatórios.' });
  }

  try {
    if (req.file) {
      console.log('Imagem recebida, enviando para Cloudinary...');
      const resultadoUpload = await cloudinary.uploader.upload(filePath); // Usa o path diretamente
      imagem_url = resultadoUpload.secure_url;
      console.log('Upload concluído! URL:', imagem_url);
      // 4. Limpa o arquivo temporário APÓS o upload bem-sucedido
      await fs.unlink(filePath).catch(err => console.error("Erro ao limpar arquivo temp após upload:", err));
    } else {
      console.log('Nenhuma imagem enviada para o post.');
    }

    const sql = 'INSERT INTO posts_blog (titulo, conteudo, imagem_url) VALUES (?, ?, ?)';
    // 2. Usando connection.promise()
    const [results] = await connection.promise().query(sql, [titulo, conteudo, imagem_url]);
    res.status(201).json({ message: 'Post criado com sucesso!', id: results.insertId });

  } catch (error) {
    // 3. Tratamento de Erros e Limpeza
    console.error('Erro no upload ou criação do post:', error);
     // Garante a limpeza do arquivo temporário em caso de erro no DB ou Cloudinary
    if (filePath) await fs.unlink(filePath).catch(err => console.error("Erro ao limpar arquivo temp em catch criarPost:", err));
    // Tenta retornar uma mensagem de erro mais específica
    const errorMessage = error.message || 'Falha ao processar a requisição.';
    res.status(500).json({ error: errorMessage });
  }
};

// Função para ATUALIZAR um post existente (protegida, com upload opcional)
exports.atualizarPost = async (req, res) => {
  const { id } = req.params;
  const { titulo, conteudo, imagem_url_existente } = req.body;
  let imagem_url = imagem_url_existente || null;
  const filePath = req.file?.path;

  console.log('--- INICIANDO ATUALIZAÇÃO DE POST ---');
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);

  // 1. Validação de Entrada
  if (isNaN(parseInt(id, 10))) {
      if (filePath) await fs.unlink(filePath).catch(err => console.error("Erro ao limpar arquivo temp:", err));
      return res.status(400).json({ message: 'ID do post inválido.'});
  }
   if (!titulo || !conteudo) {
      if (filePath) await fs.unlink(filePath).catch(err => console.error("Erro ao limpar arquivo temp:", err));
      return res.status(400).json({ message: 'Título e conteúdo são obrigatórios.' });
  }

  try {
    if (req.file) {
      console.log('Nova imagem recebida, enviando para Cloudinary...');
      const resultadoUpload = await cloudinary.uploader.upload(filePath);
      imagem_url = resultadoUpload.secure_url;
      console.log('Upload concluído! Nova URL:', imagem_url);
      await fs.unlink(filePath).catch(err => console.error("Erro ao limpar arquivo temp após upload:", err));
      // 5. Opcional: Lógica para deletar a imagem antiga do Cloudinary
      if (imagem_url_existente) {
          const publicId = imagem_url_existente.split('/').pop().split('.')[0]; // Extrai ID da URL antiga
          cloudinary.uploader.destroy(publicId)
              .then(result => console.log("Imagem antiga deletada do Cloudinary:", result))
              .catch(err => console.error("Erro ao deletar imagem antiga do Cloudinary:", err));
      }
    } else {
      console.log('Nenhuma NOVA imagem enviada. Mantendo existente (se houver).');
    }

    const sql = 'UPDATE posts_blog SET titulo = ?, conteudo = ?, imagem_url = ? WHERE id = ?';
    // 2. Usando connection.promise()
    const [results] = await connection.promise().query(sql, [titulo, conteudo, imagem_url, id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Post não encontrado.' });
    }
    res.json({ message: 'Post atualizado com sucesso!' });

  } catch (error) {
    // 3. Tratamento de Erros e Limpeza
    console.error('Erro no upload ou atualização do post:', error);
    if (filePath) await fs.unlink(filePath).catch(err => console.error("Erro ao limpar arquivo temp em catch atualizarPost:", err));
    const errorMessage = error.message || 'Falha ao processar a requisição.';
    res.status(500).json({ error: errorMessage });
  }
};

// Função para DELETAR um post (protegida)
exports.deletarPost = async (req, res) => { // Tornada async
  const { id } = req.params;

   if (isNaN(parseInt(id, 10))) {
      return res.status(400).json({ message: 'ID do post inválido.'});
  }

  const findSql = 'SELECT imagem_url FROM posts_blog WHERE id = ?';
  const deleteSql = 'DELETE FROM posts_blog WHERE id = ?';

  try {
    // 5. Opcional: Buscar URL da imagem antes de deletar
    const [findResults] = await connection.promise().query(findSql, [id]);
    const imagemUrlParaDeletar = findResults.length > 0 ? findResults[0].imagem_url : null;

    // Deletar o post do banco
    const [deleteResults] = await connection.promise().query(deleteSql, [id]);

    if (deleteResults.affectedRows === 0) {
      return res.status(404).json({ message: 'Post não encontrado.' });
    }

    // 5. Opcional: Deletar a imagem do Cloudinary se ela existia
    if (imagemUrlParaDeletar) {
      const publicId = imagemUrlParaDeletar.split('/').pop().split('.')[0];
      cloudinary.uploader.destroy(publicId)
          .then(result => console.log("Imagem associada deletada do Cloudinary:", result))
          .catch(err => console.error("Erro ao deletar imagem associada do Cloudinary:", err));
    }

    res.json({ message: 'Post deletado com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).send('Erro ao deletar dados do banco de dados');
  }
};