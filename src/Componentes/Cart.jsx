import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Asegúrate que la ruta sea correcta
import '../styles/Cart.modules.css';
import CardPaymentForm from './CardPaymentForm';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const Cart = ({ cartItems, setCartItems, removeFromCart, updateQuantity, user }) => {
  const navigate = useNavigate();
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
    email: user?.email || '',
    phone: '',
    address: '',
    zipCode: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [productsFromDB, setProductsFromDB] = useState([]);

  // Cargar productos desde Firestore
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || 'Producto sin nombre',
          price: Number(doc.data().price) || 0,
          image: doc.data().image || '/placeholder-product.jpg',
          stock: Number(doc.data().stock) || 0
        }));
        setProductsFromDB(products);
      } catch (error) {
        console.error("Error cargando productos:", error);
      }
    };
    loadProducts();
  }, []);

  // Cargar datos del usuario
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.email) {
        setCustomerData(prev => ({
          ...prev,
          email: userData.email,
          name: userData.name || '',
          ...(userData.phone && { phone: userData.phone }),
          ...(userData.address && { address: userData.address })
        }));
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  }, []);

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

  useEffect(() => {
    if (location.state?.couponCode) {
      handleApplyCoupon(location.state.couponCode);
    }
  }, [location.state, handleApplyCoupon]);

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleQuantityChange = (id, change) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;

    // Verificar stock contra la base de datos
    const dbProduct = productsFromDB.find(p => p.id === id);
    if (dbProduct && newQuantity > dbProduct.stock) {
      setPaymentError(`No hay suficiente stock para ${item.title}`);
      return;
    }

    updateQuantity(id, newQuantity);
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRealMercadoPagoPayment = async () => {
    if (!validateForm()) {
      setPaymentError('Completa todos los campos correctamente');
      return;
    }

    setLoading(true);
    setPaymentError(null);
    
    try {
      // Validar items contra la base de datos
      const validItems = cartItems.map(item => {
        const dbProduct = productsFromDB.find(p => p.id === item.id);
        return {
          id: item.id,
          title: dbProduct?.title || item.title,
          unit_price: dbProduct?.price || item.price,
          quantity: item.quantity,
          picture_url: dbProduct?.image || item.image
        };
      }).filter(item => item.title && item.unit_price > 0);

      if (validItems.length !== cartItems.length) {
        throw new Error('Algunos productos no están disponibles');
      }

      const response = await fetch(`${API_URL}/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validItems,
          payer: {
            name: customerData.name,
            email: customerData.email,
            phone: { number: customerData.phone },
            address: {
              street_name: customerData.address,
              zip_code: customerData.zipCode
            }
          },
          metadata: { userId: user?.id || 'guest' }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pago');
      }

      window.location.href = data.sandbox_init_point;
      
    } catch (error) {
      console.error('Error:', error);
      setPaymentError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRealCardPayment = async (cardData) => {
    if (!validateForm()) {
      setPaymentError('Completa todos los campos correctamente');
      return;
    }

    setLoading(true);
    setPaymentError(null);
    
    try {
      // Validar items contra la base de datos
      const validItems = cartItems.map(item => {
        const dbProduct = productsFromDB.find(p => p.id === item.id);
        if (!dbProduct || item.quantity > dbProduct.stock) {
          throw new Error(`No hay suficiente stock para ${item.title}`);
        }
        return {
          id: item.id,
          title: dbProduct.title,
          unit_price: dbProduct.price,
          quantity: item.quantity
        };
      });

      const response = await fetch(`${API_URL}/process-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validItems,
          payer: {
            name: customerData.name,
            email: customerData.email,
            phone: { number: customerData.phone },
            address: {
              street_name: customerData.address,
              zip_code: customerData.zipCode
            }
          },
          payment_method: {
            token: cardData.token,
            payment_method_id: cardData.paymentMethodId,
            installments: cardData.installments || 1
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      navigate('/order-confirmation', {
        state: {
          orderDetails: {
            items: cartItems,
            customer: customerData,
            paymentMethod: 'Tarjeta',
            total: calculateTotal(),
            paymentData: data
          }
        }
      });
      
    } catch (error) {
      console.error('Error:', error);
      setPaymentError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculateDiscount = () => calculateSubtotal() * coupon.discount;
  const calculateTotal = () => calculateSubtotal() - calculateDiscount();

  if (cartItems.length === 0) {
    return (
      <div className="cart-container empty">
        <h1>Tu carrito está vacío</h1>
        <p>No hay productos en tu carrito de compras.</p>
        <button 
          className="continue-shopping-btn"
          onClick={() => navigate('/products')}
        >
          Ver productos
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Carrito de Compras</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => {
            const dbProduct = productsFromDB.find(p => p.id === item.id) || item;
            return (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={dbProduct.image || '/placeholder-product.jpg'} 
                    alt={dbProduct.title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                
                <div className="item-details">
                  <h3>{dbProduct.title}</h3>
                  <p>Precio unitario: ${dbProduct.price.toFixed(2)}</p>
                  {dbProduct.stock && (
                    <p>Disponibles: {dbProduct.stock}</p>
                  )}
                  
                  <div className="quantity-controls">
                    <button 
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, 1)}
                      disabled={dbProduct.stock && item.quantity >= dbProduct.stock}
                    >
                      +
                    </button>
                  </div>
                  
                  <p className="item-subtotal">
                    Subtotal: ${(dbProduct.price * item.quantity).toFixed(2)}
                  </p>
                  
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="remove-btn"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <div className="coupon-section">
            <h3>Aplicar Cupón</h3>
            <div className="coupon-input">
              <input
                type="text"
                value={coupon.code}
                onChange={(e) => setCoupon({...coupon, code: e.target.value})}
                placeholder="Código de cupón"
                disabled={coupon.applied}
              />
              <button
                onClick={() => handleApplyCoupon()}
                disabled={coupon.applied || !coupon.code.trim()}
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

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            
            {coupon.discount > 0 && (
              <div className="summary-row discount">
                <span>Descuento ({coupon.discount * 100}%):</span>
                <span>-${calculateDiscount().toFixed(2)}</span>
              </div>
            )}
            
            <div className="summary-row total">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {!showPaymentForm ? (
            <button
              className="checkout-btn"
              onClick={() => setShowPaymentForm(true)}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Proceder al pago'}
            </button>
          ) : (
            <div className="payment-section">
              <h2>Información de Envío</h2>
              
              <div className="customer-form">
                <div className="form-group">
                  <label>Nombre Completo*</label>
                  <input
                    type="text"
                    name="name"
                    value={customerData.name}
                    onChange={handleInputChange}
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
                    className={formErrors.email ? 'error' : ''}
                    readOnly={!!user?.email}
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
                    className={formErrors.phone ? 'error' : ''}
                    placeholder="Ej: 1122334455"
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
                    className={formErrors.zipCode ? 'error' : ''}
                  />
                  {formErrors.zipCode && <span className="error-message">{formErrors.zipCode}</span>}
                </div>
              </div>

              <div className="payment-methods">
                <h2>Método de Pago</h2>
                
                {!paymentMethod ? (
                  <div className="method-options">
                    <button 
                      className="method-btn card"
                      onClick={() => setPaymentMethod('card')}
                      disabled={loading}
                    >
                      <i className="fas fa-credit-card"></i> Tarjeta de Crédito/Débito
                    </button>
                    
                    <button 
                      className="method-btn mercadopago"
                      onClick={handleRealMercadoPagoPayment}
                      disabled={loading}
                    >
                      <img src="/mercadopago-icon.png" alt="MercadoPago" /> Pagar con MercadoPago
                    </button>
                    
                    <button 
                      className="back-btn"
                      onClick={() => setShowPaymentForm(false)}
                      disabled={loading}
                    >
                      Volver al carrito
                    </button>
                  </div>
                ) : paymentMethod === 'card' ? (
                  <CardPaymentForm 
                    onSubmit={handleRealCardPayment}
                    onCancel={() => setPaymentMethod(null)}
                    loading={loading}
                  />
                ) : null}
              </div>

              {paymentError && (
                <div className="payment-error">
                  <p>{paymentError}</p>
                  <button onClick={() => setPaymentError(null)}>Cerrar</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;