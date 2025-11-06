import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Cria o Contexto
const CartContext = createContext();

// Função auxiliar para pegar o carrinho inicial do localStorage
const getInitialCart = () => {
  const storedCart = localStorage.getItem('cartItems');
  try {
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error("Erro ao ler carrinho do localStorage:", error);
    return []; // Retorna vazio em caso de erro
  }
};

// 2. Cria o Provedor (Provider)
export function CartProvider({ children }) {
  // Inicializa o estado com o carrinho salvo no localStorage
  const [cartItems, setCartItems] = useState(getInitialCart);

  // Efeito para salvar o carrinho no localStorage sempre que ele mudar
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Função para adicionar um produto ao carrinho
  const addToCart = (produto) => {
    setCartItems(prevItems => {
      const itemExists = prevItems.find(item => item.id === produto.id);
      if (itemExists) {
        return prevItems.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...produto, quantidade: 1 }];
      }
    });
     // Removido o alert para melhor UX
     // alert(`${produto.nome} foi adicionado ao carrinho!`);
     console.log(`${produto.nome} adicionado ao carrinho.`); // Log para confirmação
  };

  // Função para remover completamente um item do carrinho
  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    console.log(`Item ${itemId} removido do carrinho.`);
  };

  // Função para atualizar a quantidade de um item (aumentar/diminuir)
  const updateItemQuantity = (itemId, change) => { // change pode ser 1 ou -1
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantidade + change;
          // Remove o item se a quantidade chegar a 0 ou menos
          return newQuantity > 0 ? { ...item, quantidade: newQuantity } : null;
        }
        return item;
      }).filter(item => item !== null) // Remove os itens marcados como null (quantidade <= 0)
    );
     console.log(`Quantidade do item ${itemId} atualizada por ${change}.`);
  };

  // Função para limpar o carrinho (ex: após a compra)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems'); // Limpa também o localStorage
    console.log("Carrinho limpo.");
  };


  // O valor compartilhado (incluindo as novas funções)
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// 3. Hook customizado (sem alterações)
export function useCart() {
  return useContext(CartContext);
}