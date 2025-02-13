import React from 'react';
import '../styles/Footer.css'; 
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope } from 'react-icons/fa'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Sección de redes sociales */}
        <div className="social-media">
          <h3>Síguenos</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="icon" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="icon" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="icon" />
            </a>
          </div>
        </div>

        {/* Sección de contacto */}
        <div className="contact-info">
          <h3>Contacto</h3>
          <p>
            <FaEnvelope className="icon" /> info@mangari.com
          </p>
          <p>Teléfono: +52 123 456 7890</p>
        </div>

        {/* Derechos de autor */}
        <div className="copyright">
          <p>© {new Date().getFullYear()} MANGARI. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;