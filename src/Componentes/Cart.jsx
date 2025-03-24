import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Cart.css';

const Cart = ({ cartItems, setCartItems }) => {
  const handleRemove = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
  };

  const handleQuantityChange = (id, change) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          // Validar que no sea menor que 1 ni mayor que el stock disponible
          if (newQuantity < 1) return item;
          if (item.stock && newQuantity > item.stock) return item;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    // Redirigir al usuario a la página de checkout
    window.location.href = '/checkout';
  };

  return (
    <div className="cart-container">
      <h1>Carrito de Compras</h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>No hay productos en el carrito.</p>
          <Link to="/products" className="continue-shopping">
            Seguir comprando
          </Link>
        </div>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image} alt={item.title} className="cart-item-image" />
                <div className="cart-item-details">
                  <h2>{item.title}</h2>
                  <div className="quantity-control">
                    <button 
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={item.quantity <= 1}
                      className="quantity-button"
                    >
                      -
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, 1)}
                      disabled={item.stock && item.quantity >= item.stock}
                      className="quantity-button"
                    >
                      +
                    </button>
                    {item.stock && (
                      <span className="stock-info">
                        (Disponibles: {item.stock})
                      </span>
                    )}
                  </div>
                  <p>Precio unitario: ${item.price.toFixed(2)}</p>
                  <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                  <button 
                    onClick={() => handleRemove(item.id)} 
                    className="remove-button"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <div className="cart-total">
              <h2>Total a pagar: ${total.toFixed(2)}</h2>
            </div>
            <button onClick={handleCheckout} className="checkout-button">
              Comprar
            </button>
            <Link to="/products" className="continue-shopping">
              Seguir comprando
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;