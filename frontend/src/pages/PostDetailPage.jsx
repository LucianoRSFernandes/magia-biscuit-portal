import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PostDetailPage.css'; // Importa os estilos específicos da página
// Reutiliza estilos de formulário para mensagens (se StatusPage.css não foi criado ou importado)
import '../styles/FormStyles.css';
// Reutiliza estilos de página de status (se criado)
// import '../styles/StatusPage.css';
import API_URL from '../config';

function PostDetailPage() {
  const [post, setPost] = useState(null); // null: carregando, false: erro, objeto: sucesso
  const [erro, setErro] = useState(''); // Estado para mensagem de erro
  const { id } = useParams();

  useEffect(() => {
    setPost(null); // Define como carregando ao iniciar ou mudar ID
    setErro('');   // Limpa erro anterior
    fetch(`${API_URL}/api/posts/${id}`) // Endpoint público
      .then(response => {
        if (!response.ok) {
           // Tenta ler o erro, senão usa mensagem padrão
           return response.json().then(errData => { throw new Error(errData.message || 'Post não encontrado'); });
        }
        return response.json();
      })
      .then(data => setPost(data)) // Armazena dados do post
      .catch(error => {
        console.error('Erro ao buscar post:', error);
        setErro(error.message); // Guarda a mensagem de erro
        setPost(false); // Indica que houve um erro ao buscar
      });
  }, [id]); // Dependência no ID para rebuscar se ele mudar

  // Mensagem de carregamento
  if (post === null) {
    // Reutiliza o container principal para manter o estilo e adiciona classes de status
    return (
        <div className="post-detail-container status-message loading-message">
            <p>Carregando post...</p>
        </div>
    );
  }

  // Mensagem de erro
  if (post === false) {
     return (
         <div className="post-detail-container status-message error-message">
             {/* Reutiliza classes do FormStyles e/ou StatusPage */}
            <p className="form-message error">Erro: {erro || 'Post não encontrado.'}</p>
            <Link to="/blog" className="status-page-link" style={{marginTop: '1rem'}}>Voltar para o Blog</Link>
         </div>
     );
  }

  // Renderização normal do post
  return (
    // Aplica a classe principal ao container do post
    <article className="post-detail-container">
      {/* Título do Post */}
      <h1>{post.titulo || 'Post sem Título'}</h1>

      {/* Meta: Data de Publicação */}
      <small className="post-detail-meta">
        Publicado em: {post.data_publicacao ? new Date(post.data_publicacao).toLocaleDateString() : '-'}
      </small>

      {/* Imagem do Post (se existir) */}
      {post.imagem && (
        <img
          src={post.imagem}
          // Alt text mais descritivo
          alt={`Imagem ilustrativa para o post "${post.titulo}"`}
          className="post-detail-image" // Usa classe CSS
        />
      )}

      {/* Conteúdo do Post */}
      <div className="post-detail-content">
        {/* Renderiza parágrafos a partir de quebras de linha, tratando conteúdo vazio */}
        {post.conteudo ? post.conteudo.split('\n').map((paragraph, index) => (
            paragraph.trim() ? <p key={index}>{paragraph}</p> : null // Renderiza apenas parágrafos não vazios
        )) : <p>Conteúdo não disponível.</p>}
      </div>

      {/* Link para voltar */}
      <Link to="/blog" className="back-link">
        ← Voltar para o blog
      </Link>
    </article>
  );
}

export default PostDetailPage;