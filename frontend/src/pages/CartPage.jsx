import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css'; // Importa os estilos da página do carrinho

function CartPage() {
  // Acessa os itens do carrinho e funções de manipulação do contexto
  // Adicionamos removeFromCart e updateItemQuantity para uso futuro
  const { cartItems, removeFromCart, updateItemQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  // Calcula o preço total dos itens no carrinho
  const total = cartItems.reduce((sum, item) => sum + Number(item.preco) * item.quantidade, 0);

  // Função chamada ao clicar em "Ir para o Checkout"
  // Agora apenas verifica o login e navega para a página de checkout
  const handleCheckoutNavigation = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Por favor, faça o login para finalizar a compra.');
      navigate('/login'); // Redireciona para o login se não estiver logado
    } else {
      navigate('/checkout'); // Navega para a página de checkout se estiver logado
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
                <th>Quantidade</th>
                <th>Subtotal</th>
                {/* Opcional: Coluna para Ação de Remover */}
                {/* <th>Remover</th> */}
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.id}>
                  <td>
                    {/* Link para a página do produto */}
                    <Link to={`/produtos/${item.id}`} style={{ color: 'var(--cor-texto-claro)' }}>
                       {item.nome}
                    </Link>
                   </td>
                  <td>R$ {Number(item.preco).toFixed(2)}</td>
                  <td>
                    {/* Opcional: Botões para ajustar quantidade */}
                    {/* <button onClick={() => updateItemQuantity(item.id, -1)}>-</button> */}
                    {item.quantidade}
                    {/* <button onClick={() => updateItemQuantity(item.id, 1)}>+</button> */}
                  </td>
                  <td>R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</td>
                  {/* Opcional: Botão para remover item */}
                  {/* <td><button onClick={() => removeFromCart(item.id)}>X</button></td> */}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            {/* Opcional: Botão para limpar carrinho */}
            {/* <button onClick={clearCart} className="clear-cart-button">Limpar Carrinho</button> */}
            <div className="cart-total">
              <h3>Total: R$ {total.toFixed(2)}</h3>
            </div>
          </div>

          <div className="cart-actions">
            <Link to="/">Continuar Comprando</Link>
            {/* Botão que agora chama a função de navegação */}
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