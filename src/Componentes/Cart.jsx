
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Cart.css';

const Cart = ({ cartItems, setCartItems }) => {
  
  const handleRemove = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart); 
  };
 
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h1>Carrito de Compras</h1>
      {cartItems.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <ul className="cart-list">
          {cartItems.map((item) => (
            <li key={item.id} className="cart-item">
              <img src={item.image} alt={item.title} className="cart-item-image" />
              <div className="cart-item-details">
                <h2>{item.title}</h2>
                <p>Cantidad: {item.quantity}</p>
                <p>Precio unitario: ${item.price}</p>
                <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => handleRemove(item.id)} className="remove-button">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="cart-total">
        <h2>Total a pagar: ${total.toFixed(2)}</h2>
      </div>
      <Link to="/" className="continue-shopping">
        Seguir comprando
      </Link>
    </div>
  );
};

export default Cart;
