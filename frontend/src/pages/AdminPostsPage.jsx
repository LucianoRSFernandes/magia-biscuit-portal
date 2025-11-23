import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminStyles.css'; // Reutiliza estilos de admin
import API_URL from '../config';

function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(true); // 1. Adiciona estado de carregamento

  // Função para buscar posts
  const fetchPosts = async () => {
    setIsLoading(true); // Inicia carregamento
    setErro(''); // Limpa erros antigos
    try {
      // A listagem de posts é pública, não precisa de token aqui
      const response = await fetch(`${API_URL}/api/posts`);
      if (!response.ok) throw new Error('Falha ao buscar posts.');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        setErro(error.message);
    } finally {
        setIsLoading(false); // Finaliza carregamento
    }
  };

  // Busca os posts quando o componente monta
  useEffect(() => {
    fetchPosts();
  }, []); // Executa apenas uma vez

  // Função para deletar post
  const handleDelete = async (postId) => {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) return;

    setErro(''); // Limpa erro antes de tentar deletar
    const token = localStorage.getItem('token');
    if (!token) {
        setErro('Autenticação necessária. Faça o login de administrador.');
        return;
    }

    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
          let errorData;
          try {
              errorData = await response.json();
          } catch(jsonError) {
              errorData = { message: response.statusText };
          }
          throw new Error(errorData.message || 'Falha ao excluir o post.');
      }

      alert('Post excluído com sucesso!');
      setPosts(posts.filter(p => p.id !== postId)); // Atualiza a lista na tela

    } catch (error) {
      console.error("Erro ao excluir post:", error);
      setErro(`Erro ao excluir post: ${error.message}`); // Mostra erro na tela
      // O alert foi removido daqui para usar o <p> de erro
    }
  };

  return (
    <div className="admin-page-container">
      <h2>Gerenciar Posts do Blog</h2>
      <Link to="/admin/posts/novo" className="admin-button-link">
        Adicionar Novo Post
      </Link>

      {/* Exibe mensagem de erro */}
      {erro && <p style={{ color: '#ff6b6b', textAlign: 'center', fontWeight: 'bold' }}>{erro}</p>}

      {/* Exibe mensagem de carregamento */}
      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Carregando posts...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* Mensagem se não houver posts após carregar */}
            {!isLoading && !erro && posts.length === 0 ? (
               <tr><td colSpan="4" style={{textAlign: 'center'}}>Nenhum post encontrado.</td></tr>
            ) : (
              posts.map(post => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>{post.titulo}</td>
                  <td>{post.data_publicacao ? new Date(post.data_publicacao).toLocaleDateString() : '-'}</td>
                  <td className="action-buttons">
                    <Link to={`/admin/posts/editar/${post.id}`}>
                      <button>Editar</button>
                    </Link>
                    <button onClick={() => handleDelete(post.id)}>Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default AdminPostsPage;