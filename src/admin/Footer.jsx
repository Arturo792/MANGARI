import React from 'react';
import '../styles/Footer.css'; 
import { FaFacebook, FaInstagram, FaEnvelope } from 'react-icons/fa'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Sección de redes sociales */}
        <div className="social-media">
          <h3>Síguenos</h3>
          <div className="social-icons">
            <a href="https://www.facebook.com/share/17RkuQ9fCL/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="icon" />
            </a>
            <a href="https://www.instagram.com/mangari.joy/profilecard/?igsh=MTFrcGszMTQ4MXB2OQ==" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="icon" />
            </a>
           
          </div>
        </div>

        {/* Sección de contacto */}
        <div className="contact-info">
          <h3>Contacto</h3>
          <p>
            <FaEnvelope className="icon" /> mangari.joy@gmail.com
          </p>
          <p>Teléfono: +52 443-363-0406</p> 
        </div>

        {/* Derechos de autor */}
        <div className="copyright">
          <p>© {new Date().getFullYear()} MANGARI. Todos los derechos reservados.</p>
          <p>Diseñado y desarollado por ISC. Luis Arturo Aguilar Guzmán.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;