import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FormStyles.css'; // Importa os estilos de formulário

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 1. Adiciona estado de carregamento
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagem('Verificando credenciais...');
    setIsError(false);
    setIsLoading(true); // 2. Desabilita o formulário

    // IMPORTANTE: Substitua pelo email real do admin.
    // Para V2.0, considere usar variáveis de ambiente do front-end (Vite).
    const adminEmail = 'geovana.barbosa.fernandes@gmail.com';
    const isAdminLogin = email.toLowerCase() === adminEmail.toLowerCase(); // Comparação case-insensitive
    const loginUrl = isAdminLogin ? '/login' : '/clientes/login'; // Usando caminhos relativos (proxy ou URL base)
    const apiUrlBase = 'http://localhost:3000'; // URL base da API
    const fullLoginUrl = `${apiUrlBase}${loginUrl}`;
    const successMessage = isAdminLogin ? 'Login de admin bem-sucedido!' : 'Login de cliente bem-sucedido!';

    console.log(`Tentando login na URL: ${fullLoginUrl}`);

    try {
      const response = await fetch(fullLoginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setMensagem(`${successMessage} Redirecionando...`);
        setIsError(false);
        // FORÇA REDIRECIONAMENTO COMPLETO para a home page
        setTimeout(() => {
             window.location.href = '/'; // Redireciona para a raiz do site
        }, 1000); // Delay para mensagem
        // Não reabilita o form aqui, pois será redirecionado
        return; // Sai da função após sucesso

      } else {
        // Usa a mensagem da API ou uma padrão
        setMensagem(`Erro: ${data.message || 'Credenciais inválidas.'}`);
        setIsError(true);
      }
    } catch (error) {
        console.error("Erro ao tentar fazer login:", error);
        setMensagem('Erro ao conectar com o servidor de autenticação. Tente novamente.');
        setIsError(true);
    } finally {
        // 3. Reabilita o formulário APENAS se não houve sucesso (redirecionamento)
        if (!localStorage.getItem('token')) { // Verifica se o token não foi setado
             setIsLoading(false);
        }
    }
  };

  return (
    <div className="form-container">
      <h2>Página de Login</h2>
      {/* 4. Desabilita o form durante o loading */}
      <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading}>
            <div className="form-group">
              <label htmlFor="login-email">Email:</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-senha">Senha:</label>
              <input
                id="login-senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            {/* 5. Muda texto do botão e desabilita */}
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Entrar'}
            </button>
        </fieldset>
      </form>
      {/* Exibe mensagem de feedback */}
      {mensagem && <p className={`form-message ${isError ? 'error' : 'success'}`}>{mensagem}</p>}
       {/* Link para cadastro */}
       <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9em' }}>
           Ainda não tem conta? <Link to="/register" style={{ color: 'var(--cor-amarelo-principal)', fontWeight: 'bold' }}>Cadastre-se</Link>
       </p>
    </div>
  );
}

export default LoginPage;