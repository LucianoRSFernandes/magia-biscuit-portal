// frontend/src/components/Footer.jsx (Refatorado)
import React from 'react';
import './Footer.css';

function Footer() {
  const anoAtual = new Date().getFullYear();
  const telefone = "(19) 99308-3354";
  const email = "geovana.barbosa.fernandes@gmail.com";
  const numeroWhatsApp = "5519993083354"; 

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p>&copy; {anoAtual} Magia Biscuit. Todos os direitos reservados.</p>
        
        <div className="contact-info">
          <h4>Entre em Contato</h4>
          <p>Telefone: {telefone}</p>
          <p>Email: <a href={`mailto:${email}`}>{email}</a></p> 
        </div>

        <div className="social-links">
          <a href="https://www.instagram.com/magia.biscuit/" target="_blank" rel="noopener noreferrer">
            {/* Remove style, adiciona className */}
            <img src="/assets/instagram.svg" alt="Instagram" className="social-icon" /> 
          </a>
          <a href={`https://wa.me/${numeroWhatsApp}`} target="_blank" rel="noopener noreferrer">
             {/* Remove style, adiciona className */}
            <img src="/assets/whatsapp.svg" alt="WhatsApp" className="social-icon" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;