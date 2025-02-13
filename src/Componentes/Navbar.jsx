import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../img/mangari-original.png';
import '../styles/Navbar.css';

const Navbar = ({ cartItems }) => {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/Home" className="navbar-brand"> 
          <img src={logo} alt="Logo Mangari" className="navbar-logo" />
          MANGARI
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/Home" className="nav-link"> 
          Inicio
        </Link>
        <Link to="/products" className="nav-link"> 
          Productos
        </Link>
        <Link to="/piedras" className="nav-link">
          Piedras
        </Link>
        <Link to="/nosotros" className="nav-link">
          Nosotros
        </Link>
      </div>
      <div className="navbar-actions">
        <Link to="/login" className="login-link">
          <span role="img" aria-label="Iniciar sesión">
            👤
          </span>
        </Link>
        <Link to="/cart" className="cart-link">
          <span role="img" aria-label="Carrito">
            🛒
          </span>
          {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;