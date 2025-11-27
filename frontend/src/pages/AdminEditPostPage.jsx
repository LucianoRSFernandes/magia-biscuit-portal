import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/FormStyles.css'; // Reuses form styles
import API_URL from '../config';

function AdminEditPostPage() {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagemUrlAtual, setImagemUrlAtual] = useState('');
  const [novaImagem, setNovaImagem] = useState(null); // State for the new image file
  const [mensagem, setMensagem] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // Loading initial data
  const [isSubmitting, setIsSubmitting] = useState(false); // Submitting form data
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch existing post data when the component mounts or ID changes
  useEffect(() => {
    setIsLoadingData(true);
    setErro(''); // Clear previous errors
    fetch(`${API_URL}/api/posts/${id}`) // Fetch specific post (public route)
      .then(res => {
          if (!res.ok) {
              // Try to parse error message, otherwise throw generic one
              return res.json().then(errData => { throw new Error(errData.message || 'Post não encontrado'); });
          }
          return res.json();
      })
      .then(data => {
        setTitulo(data.titulo);
        setConteudo(data.conteudo);
        setImagemUrlAtual(data.imagem || ''); // Store current image URL
        setIsLoadingData(false); // Data loaded successfully
      })
      .catch(error => {
          console.error("Erro ao carregar post:", error);
          setMensagem(`Erro ao carregar dados do post: ${error.message}`);
          setIsError(true);
          setIsLoadingData(false); // Finished loading (with error)
      });
  }, [id]); // Re-run effect if ID changes

  // Handle new image selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setNovaImagem(e.target.files[0]);
    } else {
        setNovaImagem(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
     if (conteudo.length < 50) {
        setMensagem('O conteúdo do post deve ter pelo menos 50 caracteres.');
        setIsError(true);
        return;
    }

    setMensagem('Salvando alterações...');
    setIsError(false);
    setIsSubmitting(true); // Disable form

    const token = localStorage.getItem('token');
    if (!token) {
        setMensagem('Autenticação necessária. Faça o login de administrador.');
        setIsError(true);
        setIsSubmitting(false); // Re-enable form
        return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);
    // Include the new image file if one was selected
    if (novaImagem) {
      formData.append('imagem', novaImagem);
    }
    // Always send the existing image URL (back-end uses this if no new file)
    formData.append('imagem_existente', imagemUrlAtual);


    try {
      const response = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // No 'Content-Type' header needed for FormData
        },
        body: formData
      });

      if (!response.ok) {
          let errorData;
          try {
              errorData = await response.json();
          } catch(jsonError) {
              errorData = { message: response.statusText };
          }
          throw new Error(errorData.message || 'Falha ao atualizar o post.');
      }

      setMensagem('Post atualizado com sucesso! Redirecionando...');
      setIsError(false);
      setTimeout(() => navigate('/admin/posts'), 1500); // Redirect after delay

    } catch (error) {
      console.error("Erro ao atualizar post:", error);
      setMensagem(`Erro: ${error.message}`);
      setIsError(true);
    } finally {
        setIsSubmitting(false); // Re-enable form
    }
  };

  // Display loading message while fetching data
  if (isLoadingData) {
      return <div className="form-container"><p>Carregando dados do post...</p></div>;
  }
  // Display error message if fetching failed and we don't have a title
  if (isError && !titulo) {
     return <div className="form-container"><p className={`form-message error`}>{mensagem}</p></div>;
  }

  // Render the form
  return (
    <div className="form-container">
      <h2>Editar Post (ID: {id})</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-edit-titulo">Título:</label>
          <input
            id="post-edit-titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            disabled={isSubmitting} // Disable during submit
          />
        </div>
        <div className="form-group">
          <label htmlFor="post-edit-conteudo">Conteúdo:</label>
          <textarea
            id="post-edit-conteudo"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows="10"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Display current image if it exists */}
        {imagemUrlAtual && (
            <div className="form-group">
                <p style={{fontWeight: 'bold', marginBottom: '5px'}}>Imagem Atual:</p>
                <img src={imagemUrlAtual} alt="Imagem atual do post" style={{maxWidth: '200px', marginBottom: '10px', display: 'block', borderRadius: '4px'}}/>
            </div>
        )}

        {/* Input for changing the image */}
        <div className="form-group">
          <label htmlFor="post-edit-imagem">Alterar Imagem (Opcional):</label>
          <input
            id="post-edit-imagem"
            type="file"
            accept="image/*" // Accept only image files
            onChange={handleImageChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Submit button changes text and disables while submitting */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
      {/* Display feedback message */}
       {mensagem && <p className={`form-message ${isError ? 'error' : 'success'}`}>{mensagem}</p>}
    </div>
  );
}
export default AdminEditPostPage;