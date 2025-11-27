import React from 'react';
// Caminho relativo ajustado para encontrar o CartContext na estrutura src/context
// Assumindo que o arquivo está em src/pages/CartPage.jsx e o contexto em src/context/CartContext.jsx
import { useCart } from '../context/CartContext'; 
import { Link, useNavigate } from 'react-router-dom';
// O arquivo CSS está na mesma pasta, então o caminho é relativo
import './CartPage.css'; 

function CartPage() {
  // Acessa os itens e funções do contexto
  const { cartItems, removeFromCart, updateItemQuantity } = useCart();
  const navigate = useNavigate();

  // Calcula o total
  const total = cartItems.reduce((sum, item) => sum + Number(item.preco) * item.quantidade, 0);

  const handleCheckoutNavigation = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Por favor, faça o login para finalizar a compra.');
      navigate('/login'); 
    } else {
      navigate('/checkout'); 
    }
  };

  return (
    <div className="cart-container">
      <h2>Seu Carrinho de Compras</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart-message">
          Seu carrinho está vazio. <Link to="/">Voltar para a loja</Link>.
        </p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço Unit.</th>
                <th>Qtd</th>
                <th>Subtotal</th>
                {/* CORREÇÃO: Descomentei o cabeçalho */}
                <th>Ações</th> 
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/produtos/${item.id}`} style={{ color: 'var(--cor-texto-claro)' }}>
                       {item.nome}
                    </Link>
                   </td>
                  <td>R$ {Number(item.preco).toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {/* Botões de + e - opcionais, mas funcionais se quiser usar */}
                        {/* <button onClick={() => updateItemQuantity(item.id, -1)} style={{padding: '2px 8px'}}>-</button> */}
                        <span>{item.quantidade}</span>
                        {/* <button onClick={() => updateItemQuantity(item.id, 1)} style={{padding: '2px 8px'}}>+</button> */}
                    </div>
                  </td>
                  <td>R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</td>
                  
                  {/* CORREÇÃO: Descomentei e estilizei o botão de remover */}
                  <td>
                    <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ 
                            backgroundColor: '#ff4444', 
                            color: 'white', 
                            fontSize: '0.8rem',
                            padding: '5px 10px'
                        }}
                        title="Remover item"
                    >
                        Remover 🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <div className="cart-total">
              <h3>Total: R$ {total.toFixed(2)}</h3>
            </div>
          </div>

          <div className="cart-actions">
            <Link to="/">Continuar Comprando</Link>
            <button onClick={handleCheckoutNavigation} className="checkout-button">
              Ir para o Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;