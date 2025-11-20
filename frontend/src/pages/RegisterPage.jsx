import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/FormStyles.css'; // Importa os estilos de formulário
import API_URL from '../config';

function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState(''); // Estado para confirmação de senha
  const [mensagem, setMensagem] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações de entrada
    if (senha !== senhaConfirm) {
      setMensagem('As senhas não coincidem.');
      setIsError(true);
      return;
    }
    if (senha.length < 6) {
       setMensagem('A senha deve ter pelo menos 6 caracteres.');
       setIsError(true);
       return;
    }

    setMensagem('Registrando...');
    setIsError(false);
    setIsLoading(true); // Desabilita o formulário

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Cadastro realizado com sucesso! Redirecionando para o login...');
        setIsError(false);
        setTimeout(() => {
          navigate('/login'); // Redireciona para o login
        }, 2000); // Delay para o usuário ler a mensagem
        // Não reabilita o form, pois será redirecionado
        return;
      } else {
         setMensagem(`Erro: ${data.message || 'Falha no registro.'}`);
         setIsError(true);
      }
    } catch (error) {
       console.error("Erro ao registrar:", error);
       setMensagem('Erro ao conectar com o servidor.');
       setIsError(true);
    } finally {
        // Só reabilita o form se não houver sucesso no redirecionamento
        if(isError || !response.ok) setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Crie sua Conta</h2>
      <form onSubmit={handleSubmit}>
        {/* Desabilita o form durante o envio */}
        <fieldset disabled={isLoading}>
          <div className="form-group">
            <label htmlFor="reg-nome">Nome:</label>
            <input
              id="reg-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email:</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-senha">Senha (mín. 6 caracteres):</label>
            <input
              id="reg-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-senha-confirm">Confirme a Senha:</label>
            <input
              id="reg-senha-confirm"
              type="password"
              value={senhaConfirm}
              onChange={(e) => setSenhaConfirm(e.target.value)}
              required
            />
          </div>
          {/* Muda o texto do botão durante o carregamento */}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Cadastrar'}
          </button>
        </fieldset>
      </form>
      {/* Exibe mensagem de feedback */}
      {mensagem && <p className={`form-message ${isError ? 'error' : 'success'}`}>{mensagem}</p>}
      
      {/* Link para a página de login */}
      <p className="form-sub-link">
         Já tem uma conta? <Link to="/login">Faça o login</Link>
      </p>
    </div>
  );
}

export default RegisterPage;