import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../img/mangari-original.png';
import carrito from '../img/bolsa.png';
import perfil from '../img/perfil.png'; 
import campana from '../img/notification.png'; // Asegúrate de tener este icono
import '../styles/Navbar.css';

const Navbar = ({ cartItems }) => {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [showCoupon, setShowCoupon] = useState(false);

  useEffect(() => {
    const fetchCoupon = async () => {
      const couponDoc = await getDoc(doc(db, "coupons", "active"));
      if (couponDoc.exists() && couponDoc.data().code) {
        setActiveCoupon(couponDoc.data());
      }
    };
    
    fetchCoupon();
  }, []);

  const toggleCoupon = () => {
    setShowCoupon(!showCoupon);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/Home" className="navbar-brand"> 
          <img src={logo} alt="Logo Mangari" className="navbar-logo" />
          MANGARI
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/Home" className="nav-link">Inicio</Link>
        <Link to="/products" className="nav-link">Productos</Link>
        <Link to="/piedras" className="nav-link">Piedras</Link>
        <Link to="/nosotros" className="nav-link">Nosotros</Link>
      </div>
      <div className="navbar-actions">
        {activeCoupon && (
          <div className="coupon-container">
            <button onClick={toggleCoupon} className="coupon-bell">
              <img src={campana} alt="Notificaciones" className="navbar-icon" />
              <span className="coupon-alert">!</span>
            </button>
            {showCoupon && (
              <div className="coupon-dropdown">
                <div className="coupon-header">
                  <span className="coupon-badge">🎉</span>
                  <h4>¡Cupón disponible!</h4>
                </div>
                <div className="coupon-details">
                  <p>
                    Usa el código <strong>{activeCoupon.code}</strong> para obtener un 
                    <strong> {activeCoupon.discount}%</strong> de descuento
                  </p>
                  <Link to="/cart" className="coupon-button">
                    Aplicar cupón
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
        <Link to="/login" className="login-link">
          <img src={perfil} alt="Iniciar sesión" className="navbar-icon" />
        </Link>
        <Link to="/cart" className="cart-link">
          <img src={carrito} alt="Carrito" className="navbar-icon" />
          {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;