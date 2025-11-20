import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FormStyles.css';
import { Link } from 'react-router-dom';
import API_URL from '../config'; // Importação correta

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagem('Verificando credenciais...');
    setIsError(false);
    setIsLoading(true);

    const adminEmail = 'geovana.barbosa.fernandes@gmail.com';
    const isAdminLogin = email.toLowerCase() === adminEmail.toLowerCase();

    // --- CORREÇÃO AQUI: Adicionado /api e /auth ---
    const loginUrl = isAdminLogin 
        ? '/api/auth/login'       // Caminho completo para login de Admin
        : '/api/clientes/login';  // Caminho completo para login de Cliente
    
    const fullLoginUrl = `${API_URL}${loginUrl}`;
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
             window.location.href = '/'; 
        }, 1000); 
        
        return; 

      } else {
        setMensagem(`Erro: ${data.message || 'Credenciais inválidas.'}`);
        setIsError(true);
      }
    } catch (error) {
        console.error("Erro ao tentar fazer login:", error);
        setMensagem('Erro ao conectar com o servidor de autenticação. Tente novamente.');
        setIsError(true);
    } finally {
        if (!localStorage.getItem('token')) { 
             setIsLoading(false);
        }
    }
  };

  return (
    <div className="form-container">
      <h2>Página de Login</h2>
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
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Entrar'}
            </button>
        </fieldset>
      </form>
      {mensagem && <p className={`form-message ${isError ? 'error' : 'success'}`}>{mensagem}</p>}
       <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9em' }}>
           Ainda não tem conta? <Link to="/register" style={{ color: 'var(--cor-amarelo-principal)', fontWeight: 'bold' }}>Cadastre-se</Link>
       </p>
    </div>
  );
}

export default LoginPage;