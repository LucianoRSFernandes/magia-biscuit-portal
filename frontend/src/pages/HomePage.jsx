import React, { useState, useEffect } from 'react';
import ProdutoCard from '../components/ProdutoCard';
import { Link } from 'react-router-dom';
import '../App.css'; 
import './HomePage.css';
import API_URL from '../config';

function HomePage() {
  const [todosOsProdutos, setTodosOsProdutos] = useState([]);
  const [produtosBanner, setProdutosBanner] = useState([]); // Apenas produtos no banner
  const [postsPreview, setPostsPreview] = useState([]); // Para a seção "Fique por Dentro"
  const [indiceAtualBanner, setIndiceAtualBanner] = useState(0); // Índice para o carrossel de produtos

  useEffect(() => {
    // Busca todos os produtos e posts
    Promise.all([
      fetch(`${API_URL}/api/produtos`),
      fetch(`${API_URL}/api/posts`)
    ])
    .then(async([resProdutos, resPosts]) => {
      const produtos = await resProdutos.json();
      const posts = await resPosts.json();
      
      setTodosOsProdutos(produtos); // Salva todos para a seção "Todos os Produtos"
      setProdutosBanner(produtos.slice(0, 5)); // Pega os 5 produtos mais recentes para o banner
      setPostsPreview(posts.slice(0, 3)); // Pega os 3 posts mais recentes para a seção de preview
    })
    .catch(error => console.error('Erro ao buscar dados:', error));
  }, []); 

  // Efeito para trocar o item do banner (agora só produtos)
  useEffect(() => {
    if (produtosBanner.length > 0) {
      const intervalId = setInterval(() => {
        setIndiceAtualBanner(prevIndice => (prevIndice + 1) % produtosBanner.length);
      }, 5000); // Muda a cada 5 segundos

      return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar
    }
  }, [produtosBanner.length]); 

  // Seleciona o produto atual para o banner
  const produtoAtualBanner = produtosBanner[indiceAtualBanner];

  return (
    <main>
      {/* --- SEÇÃO DO BANNER (APENAS PRODUTOS) --- */}
      <h2 className="banner-titulo">Últimas Criações</h2> 
      <div className="banner-carrossel"> {/* Reutilizamos a classe do CSS anterior */}
        
        {/* Exibe o produto atual do carrossel */}
        <div className="banner-item-produto"> 
          {produtoAtualBanner ? (
            <ProdutoCard produto={produtoAtualBanner} />
          ) : (
            <p>Carregando destaques...</p>
          )}
        </div>
        {/* Removemos a coluna do blog daqui */}
      </div>

      {/* --- SEÇÃO PREVIEW DO BLOG --- */}
      <section className="blog-preview-section">
        <h2 className="section-title">Fique por Dentro</h2>
        <div className="blog-preview-container">
          {postsPreview.length > 0 ? (
            postsPreview.map(post => (
              <div key={post.id} className="post-preview-card">
                <h3>{post.titulo}</h3>
                <p>{post.conteudo.substring(0, 120)}...</p> 
                <Link to={`/posts/${post.id}`} className="read-more-link">Leia mais →</Link>
              </div>
            ))
          ) : (
            <p>Carregando posts...</p>
          )}
        </div>
      </section>
      
      {/* --- SEÇÃO COMPLETA DE PRODUTOS --- */}
      <h2 className="section-title">Todos os Produtos</h2>
      <div className="lista-produtos"> 
        {todosOsProdutos.length > 0 ? (
          todosOsProdutos.map(produto => (
            <ProdutoCard key={produto.id} produto={produto} />
          ))
        ) : (
          <p>Carregando produtos...</p>
        )}
      </div>
    </main>
  );
}

export default HomePage;