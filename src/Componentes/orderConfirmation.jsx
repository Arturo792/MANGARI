import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/orderConfirmation.css';

const OrderConfirmation = () => {
  return (
    <div className="confirmation-container">
      <h1>¡Gracias por tu compra!</h1>
      <p>Tu pedido ha sido procesado exitosamente.</p>
      <Link to="/" className="continue-shopping">
        Volver a la tienda
      </Link>
    </div>
  );
};

export default OrderConfirmation;