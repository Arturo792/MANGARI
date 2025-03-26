import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/Cart.css';

const Cart = ({ cartItems, setCartItems }) => {
  const location = useLocation();
  const [coupon, setCoupon] = useState({
    code: '',
    discount: 0,
    message: '',
    applied: false
  });
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    zipCode: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Obtener datos del usuario si está logueado
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.email) {
      setCustomerData(prev => ({
        ...prev,
        email: userData.email,
        name: userData.name || ''
      }));
    }
  }, []);

  // Función para aplicar cupón
  const handleApplyCoupon = useCallback((code = coupon.code) => {
    const upperCode = code.toUpperCase().trim();
    
    if (upperCode === 'BIENVENIDO10') {
      setCoupon({
        code: upperCode,
        discount: 0.1,
        message: '¡Cupón aplicado! 10% de descuento',
        applied: true
      });
      return true;
    }
    
    setCoupon({
      code: upperCode,
      discount: 0,
      message: 'Cupón no válido',
      applied: false
    });
    return false;
  }, [coupon.code]);

  // Aplicar cupón automáticamente si viene de registro
  useEffect(() => {
    if (location.state?.couponCode) {
      handleApplyCoupon(location.state.couponCode);
    }
  }, [location.state, handleApplyCoupon]);

  // Función para eliminar producto del carrito
  const handleRemove = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
  };

  // Función para cambiar cantidad de productos
  const handleQuantityChange = (id, change) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          if (newQuantity < 1) return item;
          if (item.stock && newQuantity > item.stock) return item;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Validar formulario de cliente
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^\d{10,15}$/;
    const zipCodeRegex = /^\d{4,6}$/;

    if (!customerData.name.trim()) errors.name = 'Nombre requerido';
    if (!emailRegex.test(customerData.email)) errors.email = 'Email inválido';
    if (!phoneRegex.test(customerData.phone)) errors.phone = 'Teléfono inválido (10-15 dígitos)';
    if (!customerData.address.trim()) errors.address = 'Dirección requerida';
    if (!zipCodeRegex.test(customerData.zipCode)) errors.zipCode = 'Código postal inválido (4-6 dígitos)';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Función para manejar el pago con MercadoPago
  const handlePayment = async () => {
    if (!validateForm()) {
      setPaymentError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    setPaymentError(null);
    
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      const payload = {
        items: cartItems.map(item => ({
          title: item.title.substring(0, 50),
          unit_price: item.price,
          quantity: item.quantity,
          ...(item.image && { picture_url: item.image })
        })),
        payer: {
          name: customerData.name,
          email: customerData.email,
          phone: {
            number: customerData.phone
          },
          address: {
            street_name: customerData.address,
            zip_code: customerData.zipCode
          }
        },
        back_urls: {
          success: `${window.location.origin}/pago-exitoso`,
          failure: `${window.location.origin}/pago-fallido`,
          pending: `${window.location.origin}/pago-pendiente`
        },
        auto_return: 'approved',
        metadata: {
          userId: userData.id || 'guest',
          coupon: coupon.applied ? coupon.code : 'none'
        }
      };

      const response = await fetch('http://localhost:3001/create-preference', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar el pago');
      }
      
      const { init_point } = await response.json();
      window.location.href = init_point;

    } catch (error) {
      console.error('Error en el pago:', error);
      setPaymentError(error.message || 'Ocurrió un error al procesar tu pago. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * coupon.discount;
  const total = subtotal - discountAmount;

  return (
    <div className="cart-container">
      <h1>Carrito de Compras</h1>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>No hay productos en el carrito.</p>
          <a href="/products" className="continue-shopping">
            Seguir comprando
          </a>
        </div>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <img 
                  src={item.image || '/placeholder-product.jpg'} 
                  alt={item.title} 
                  className="cart-item-image" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
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
          
          <div className="coupon-section">
            <h3>Aplicar Cupón</h3>
            <div className="coupon-input">
              <input
                type="text"
                value={coupon.code}
                onChange={(e) => setCoupon({...coupon, code: e.target.value})}
                placeholder="Ingresa tu código"
                disabled={coupon.applied}
              />
              <button 
                onClick={() => handleApplyCoupon()}
                disabled={coupon.applied}
              >
                {coupon.applied ? 'Aplicado' : 'Aplicar'}
              </button>
            </div>
            {coupon.message && (
              <p className={`coupon-message ${coupon.applied ? 'success' : 'error'}`}>
                {coupon.message}
              </p>
            )}
          </div>

          {showPaymentForm ? (
            <div className="payment-form">
              <h3>Información de Envío</h3>
              
              <div className="form-group">
                <label>Nombre Completo*</label>
                <input
                  type="text"
                  name="name"
                  value={customerData.name}
                  onChange={handleInputChange}
                  required
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>
              
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={customerData.email}
                  onChange={handleInputChange}
                  required
                  className={formErrors.email ? 'error' : ''}
                  readOnly={!!customerData.email} // Hacerlo de solo lectura si ya tiene valor
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
              
              <div className="form-group">
                <label>Teléfono*</label>
                <input
                  type="tel"
                  name="phone"
                  value={customerData.phone}
                  onChange={handleInputChange}
                  required
                  className={formErrors.phone ? 'error' : ''}
                  placeholder="Ej: 1123456789"
                />
                {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label>Dirección*</label>
                <input
                  type="text"
                  name="address"
                  value={customerData.address}
                  onChange={handleInputChange}
                  required
                  className={formErrors.address ? 'error' : ''}
                />
                {formErrors.address && <span className="error-message">{formErrors.address}</span>}
              </div>
              
              <div className="form-group">
                <label>Código Postal*</label>
                <input
                  type="text"
                  name="zipCode"
                  value={customerData.zipCode}
                  onChange={handleInputChange}
                  required
                  className={formErrors.zipCode ? 'error' : ''}
                  placeholder="Ej: 1234"
                />
                {formErrors.zipCode && <span className="error-message">{formErrors.zipCode}</span>}
              </div>
              
              <div className="form-actions">
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setPaymentError(null);
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  className="confirm-button"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span> Procesando...
                    </>
                  ) : (
                    'Confirmar Pago'
                  )}
                </button>
              </div>
              
              {paymentError && (
                <div className="payment-error-message">
                  <p>{paymentError}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} productos):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {coupon.discount > 0 && (
                <div className="summary-row discount">
                  <span>Descuento ({coupon.discount * 100}%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="summary-row total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <button 
                className="checkout-button"
                onClick={() => setShowPaymentForm(true)}
                disabled={cartItems.length === 0}
              >
                Proceder al Pago
              </button>
              
              <a href="/products" className="continue-shopping">
                Seguir comprando
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;