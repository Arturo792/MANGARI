import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/Cart.modules.css';
import CardPaymentForm from './CardPaymentForm';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const FRONT_END = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';

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
          title: doc.data().name || doc.data().title || 'Producto sin nombre',
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

  useEffect(() => {
  const loadUserDoc = async () => {
    if (user?.uid) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setCustomerData(prev => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            zipCode: data.zipCode || prev.zipCode
          }));
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario desde Firestore:', error);
      }
    }
  };

  loadUserDoc();
}, [user?.uid]);

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

  const handleApplyCoupon = useCallback(async (codeInput) => {
  const code = (codeInput || coupon.code).toUpperCase().trim();

  try {
    const docRef = doc(db, 'coupons', 'active');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      setCoupon({
        code,
        discount: 0,
        message: 'No hay cupones activos disponibles.',
        applied: false,
      });
      return false;
    }

    const data = docSnap.data();
    const activeCode = data.code?.toUpperCase().trim();

    if (code === activeCode) {
      const discountDecimal = data.discount / 100;

      setCoupon({
        code,
        discount: discountDecimal,
        message: `¡Cupón aplicado! ${data.discount}% de descuento`,
        applied: true,
      });

      return true;
    } else {
      setCoupon({
        code,
        discount: 0,
        message: 'Cupón no válido',
        applied: false,
      });

      return false;
    }
  } catch (error) {
    console.error('Error al verificar el cupón:', error);
    setCoupon({
      code,
      discount: 0,
      message: 'Hubo un error al aplicar el cupón. Intenta de nuevo.',
      applied: false,
    });
    return false;
  }
}, [coupon.code, setCoupon]);



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

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const handleRealMercadoPagoPayment = async () => {
    if (!validateForm()) {
      setPaymentError('Completa todos los campos correctamente');
      return;
    }

    setLoading(true);
    setPaymentError(null);
  
    try {
      const subtotal = calculateSubtotal() - calculateDiscount();
      const shippingCost = await calculateShipping(); // ✅ Esperamos el valor

  
    const validItems = cartItems.map(item => {
    const dbProduct = productsFromDB.find(p => p.id === item.id);
    const basePrice = dbProduct?.price || item.price;
    const discountedPrice = basePrice * (1 - coupon.discount);

    return {
      id: item.id,
      title: dbProduct?.title || item.title,
      unit_price: Number(discountedPrice.toFixed(2)),
      quantity: item.quantity,
      picture_url: dbProduct?.image || item.image
    };
       }).filter(item => item.title && item.unit_price > 0);

  
      if (validItems.length !== cartItems.length) {
        throw new Error('Algunos productos no están disponibles');
      }
  
      if (shippingCost > 0) {
        validItems.push({
          id: 'shipping',
          title: 'Costo de envío',
          unit_price: shippingCost,
          quantity: 1,
          picture_url: ''
        });
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
          shipments: {
            cost: shippingCost,
            free_shipping: shippingCost === 0
          },
          metadata: { 
          userId: user?.id || 'guest',
          coupon: coupon.code || 'none',
          discount: coupon.discount,
          shippingCost,
          subtotal: subtotal.toFixed(2),
          total: (subtotal + shippingCost).toFixed(2) // ✅ Ya puedes usar toFixed
        },

          back_urls: {
            success: `${FRONT_END}/pago-exitoso`,
            failure: `${FRONT_END}/cart`,
            pending: `${FRONT_END}/cart`,
          },
          auto_return: 'approved',
          
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

      navigate('/pago-exitoso', {
        state: {
          items: cartItems,
          customer: customerData,
          total: calculateTotal().toFixed(2),
          paymentData: data
        }
      });
      
    } catch (error) {
      console.error('Error:', error);
      setPaymentError(error.message);
    } finally {
      setLoading(false);
    }
  };


  // Funciones de cálculo
  const calculateSubtotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculateDiscount = () => calculateSubtotal() * coupon.discount;
  const calculateShipping = async () => {
  const docRef = doc(db, "settings", "shipping");
  const docSnap = await getDoc(docRef);

  let costoEnvio = 0;
  let freeFrom = 0; // Valor por defecto

  if (docSnap.exists()) {
    costoEnvio = docSnap.data().cost;
    freeFrom = docSnap.data().freeFrom; 


    console.log("Document data:", docSnap.data());
  } else {
    console.log("No such document!");
  }

  const subtotalAfterDiscount = calculateSubtotal() - calculateDiscount();
  return subtotalAfterDiscount < freeFrom ? costoEnvio : 0;
};
  
  const [shipping, setShipping] = useState(0);

  useEffect(() => {
    const fetchShipping = async () => {
      const cost = await calculateShipping();
      setShipping(cost);
    };
    fetchShipping();
  }, [cartItems, coupon]);

    const calculateTotal = () => (calculateSubtotal() - calculateDiscount()) + shipping;



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
            
           <div className={`summary-row shipping ${shipping === 0 ? 'free' : 'paid'}`}>
              <span>
                Envío:
                {shipping === 0 && (
                  <span className="free-shipping-badge">¡Gratis!</span>
                )}
              </span>
              <span>
                {shipping === 0 ? (
                  <span className="free-shipping-text">$0.00</span>
                ) : (
                  <span className="paid-shipping-text">${shipping.toFixed(2)}</span>
                )}
              </span>
            </div>

            
            <div className={`summary-row total ${calculateShipping() === 0 ? 'free-shipping-total' : ''}`}>
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