import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FormStyles.css'; // Importa os estilos de formulário

function AdminAddPostPage() {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState(null); // Estado para o arquivo de imagem
  const [mensagem, setMensagem] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    // Pega o primeiro arquivo selecionado
    if (e.target.files && e.target.files[0]) {
      setImagem(e.target.files[0]);
    } else {
      setImagem(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validação básica adicional (exemplo)
    if (conteudo.length < 50) {
        setMensagem('O conteúdo do post deve ter pelo menos 50 caracteres.');
        setIsError(true);
        return;
    }

    setMensagem('Enviando post...');
    setIsError(false);
    setIsLoading(true); // Desabilita o botão

    const token = localStorage.getItem('token');
    if (!token) {
        setMensagem('Autenticação necessária. Faça o login de administrador.');
        setIsError(true);
        setIsLoading(false);
        return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);
    // Adiciona a imagem apenas se um arquivo foi selecionado
    if (imagem) {
        formData.append('imagem', imagem);
    }

    try {
      const response = await fetch('http://localhost:3000/posts', {
        method: 'POST',
        headers: {
          // Não definir 'Content-Type' ao enviar FormData
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      // Verifica se a resposta foi OK (status 2xx)
      if (!response.ok) {
          // Tenta ler a mensagem de erro do corpo da resposta
          let errorData;
          try {
              errorData = await response.json();
          } catch (jsonError) {
              // Se não conseguir ler o JSON, usa o status text
              errorData = { message: response.statusText };
          }
          throw new Error(errorData.message || 'Falha ao criar post.');
      }

      // Se chegou aqui, a resposta foi OK (status 201)
      setMensagem('Post criado com sucesso! Redirecionando...');
      setIsError(false);
      setTimeout(() => navigate('/admin/posts'), 1500); // Redireciona após um tempo

    } catch (error) {
      console.error("Erro ao criar post:", error);
      setMensagem(`Erro: ${error.message}`);
      setIsError(true);
    } finally {
      setIsLoading(false); // Reabilita o botão independentemente do resultado
    }
  };

  return (
    <div className="form-container">
      <h2>Adicionar Novo Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-titulo">Título:</label>
          <input
            id="post-titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            disabled={isLoading} // Desabilita durante o envio
          />
        </div>
        <div className="form-group">
          <label htmlFor="post-conteudo">Conteúdo:</label>
          <textarea
            id="post-conteudo"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows="10" // Altura inicial da área de texto
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="post-imagem">Imagem (Opcional):</label>
          <input
            id="post-imagem"
            type="file"
            accept="image/*" // Aceita apenas arquivos de imagem
            onChange={handleImageChange}
            disabled={isLoading}
          />
        </div>
        {/* Desabilita o botão enquanto está carregando */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Criar Post'}
        </button>
      </form>
      {/* Exibe mensagem de feedback */}
      {mensagem && <p className={`form-message ${isError ? 'error' : 'success'}`}>{mensagem}</p>}
    </div>
  );
}
export default AdminAddPostPage;