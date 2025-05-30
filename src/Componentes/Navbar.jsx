import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import logo from '../img/mangari-original.png';
import carrito from '../img/bolsa.png';
import perfil from '../img/perfil.png'; 
import campana from '../img/notification.png'; // Asegúrate de tener este icono
import '../styles/Navbar.css';

const Navbar = ({ cartItems }) => {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [showCoupon, setShowCoupon] = useState(false);

useEffect(() => {
  const fetchActiveCoupon = async () => {
    try {
      const now = new Date();

      const couponsQuery = query(
        collection(db, "coupons"),
        where("isActive", "==", true)
      );

      const snapshot = await getDocs(couponsQuery);
      const activeCoupons = snapshot.docs
        .map(doc => doc.data())
        .filter(coupon => {
          if (!coupon.expirationDate) return false;
          const expiration = new Date(coupon.expirationDate.seconds * 1000);
          return expiration > now;
        });

      if (activeCoupons.length > 0) {
        setActiveCoupons(activeCoupons); // solo tomamos el primero
      }

    } catch (error) {
      console.error("Error buscando cupones activos:", error);
    }
  };

  fetchActiveCoupon();
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
 

        {activeCoupons.length > 0 && (
          <div className="coupon-container">
            <button onClick={toggleCoupon} className="coupon-bell">
              <img src={campana} alt="Notificaciones" className="navbar-icon" />
              {!showCoupon && (
              <span className="coupon-alert">{activeCoupons.length}</span>
              )}  

            </button>
            {showCoupon && (
              <div className="coupon-dropdown">
                <div className="coupon-header">
                  <span className="coupon-badge">🎉</span>
                  <h4>{activeCoupons.length === 1 ? "¡Cupón disponible!" : "¡Cupones disponibles!"}</h4>
                </div>
                <div className="coupon-list">
                  {activeCoupons.map((coupon) => (
                    <div key={coupon.code} className="coupon-details">
                      <p>
                        Usa <strong>{coupon.code}</strong> para <strong>{coupon.discount}%</strong> de descuento
                      </p>
                      <Link to="/cart" className="coupon-button">
                        Aplicar
                      </Link>
                      <hr />
                    </div>
                  ))}
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