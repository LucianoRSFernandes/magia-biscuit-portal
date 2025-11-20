// src/config.js

// O Vite sabe automaticamente se estamos rodando local ou buildando para produção
const API_URL = import.meta.env.PROD 
    ? 'https://magia-biscuit-api.onrender.com'  // Endereço do Render (Seu Back-end na Nuvem)
    : 'http://localhost:3000';                  // Endereço Local

export default API_URL;