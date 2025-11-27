import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminStyles.css';
import './HomePage.css';
import API_URL from '../config';

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setErro('');
    fetch(`${API_URL}/api/posts`)
      .then(response => {
        if (!response.ok) {
           return response.json().then(errData => { throw new Error(errData.message || 'Falha ao buscar posts.'); });
        }
        return response.json();
      })
      .then(data => {
        setPosts(data);
      })
      .catch(error => {
        console.error('Erro ao buscar posts:', error);
        setErro(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="admin-page-container">
      <h2 className="section-title">Nosso Blog</h2> {/* Usa classe de título padrão */}

      {/* Exibe mensagem de erro, se houver */}
      {erro && <p style={{ color: '#ff6b6b', textAlign: 'center', fontWeight: 'bold' }}>{erro}</p>}

      {/* Exibe mensagem de carregamento */}
      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Carregando posts...</p>
      ) : (
        <>
          {/* Mensagem se não houver posts após carregar */}
          {!isLoading && !erro && posts.length === 0 ? (
            <p style={{ textAlign: 'center' }}>Nenhum post encontrado.</p>
          ) : (
            // Reutiliza o container de grid da HomePage para layout de 3 colunas
            <div className="blog-preview-container">
              {posts.map(post => (
                // Reutiliza o card de preview da HomePage
                <div key={post.id} className="post-preview-card">

                  {/* Exibe a imagem do post, se existir */}
                  {post.imagem && (
                    <img
                      src={post.imagem}
                      alt={post.titulo || 'Imagem do post'}
                      className="post-preview-image" // Usa a classe definida em HomePage.css
                    />
                  )}

                  {/* Título do Post como Link */}
                  <h3>
                    <Link to={`/posts/${post.id}`} style={{ color: 'var(--cor-amarelo-principal)' }}>
                      {post.titulo || 'Post sem título'}
                    </Link>
                  </h3>

                  {/* Resumo do Conteúdo */}
                  {/* Usamos 'resumo' se a API retornar, senão cortamos 'conteudo' */}
                  <p>{post.resumo || post.conteudo?.substring(0, 120) + '...' || ''}</p>

                  {/* Data de Publicação */}
                  <small style={{ color: 'var(--cor-destaque)', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    Publicado em: {post.data_publicacao ? new Date(post.data_publicacao).toLocaleDateString() : '-'}
                  </small>

                  {/* Link Leia Mais */}
                  <Link to={`/posts/${post.id}`} className="read-more-link">Leia mais →</Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BlogPage;