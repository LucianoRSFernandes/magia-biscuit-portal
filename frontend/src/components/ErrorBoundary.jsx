// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // Você também pode registrar o erro em um serviço de relatórios de erro
    console.error("ErrorBoundary capturou um erro:", error, errorInfo);
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback personalizada
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Algo deu errado.</h2>
          <p>Ocorreu um erro na renderização desta parte da aplicação.</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    // Se não houver erro, renderize os filhos normalmente
    return this.props.children;
  }
}
export default ErrorBoundary;