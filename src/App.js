import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Products from './Componentes/Products';
import Navbar from './Componentes/Navbar';
import Login from './Componentes/login';
import Register from './Componentes/Register';
import ProductDetail from './Componentes/ProductDetail';
import Cart from './Componentes/Cart';
import Home from './Componentes/Home';
import Piedras from './Componentes/Piedras';
import Nosotros from './admin/Nosotros';
import Footer from './admin/Footer';
import AdminPanel from './admin/adminPanel';
import AdminNavbar from './admin/adminNavbar';
import AddProduct from './admin/addProduct';
import AdminProducts from './admin/adminProducts';
import EditProduct from './admin/editProduct';
import AddAdmin from './admin/addAdmin';
import EditProfile from './Componentes/editProfile';
import Checkout from './admin/Checkout';
import OrderConfirmation from './admin/orderConfirmation';
import './App.css';

const App = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  // Función para validar el formato de los items del carrito
  const isValidCartItem = (item) => {
    return (
      item &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&  // Cambié title por name para coincidir con tu estructura
      typeof item.price === 'number' &&
      !isNaN(item.price) &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );
  };
  // Cargar carrito desde localStorage de forma segura
  const loadCartFromStorage = (userId) => {
    try {
      const cartKey = `cart_${userId}`;
      const savedCart = localStorage.getItem(cartKey);
      
      if (!savedCart) return [];
      
      const parsedCart = JSON.parse(savedCart);
      
      if (Array.isArray(parsedCart) && parsedCart.every(isValidCartItem)) {
        return parsedCart;
      } else {
        console.warn('Datos de carrito inválidos encontrados, limpiando...');
        localStorage.removeItem(cartKey);
        return [];
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      return [];
    }
  };

  // Guardar carrito en localStorage de forma segura
  const saveCartToStorage = (userId, cart) => {
    try {
      if (Array.isArray(cart) && cart.every(isValidCartItem)) {
        localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
      }
    } catch (error) {
      console.error('Error al guardar el carrito:', error);
    }
  };

  // Limpiar datos corruptos del localStorage
  const cleanCorruptedCartData = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cart_')) {
        try {
          const data = localStorage.getItem(key);
          JSON.parse(data);
        } catch {
          console.log(`Eliminando dato corrupto: ${key}`);
          localStorage.removeItem(key);
        }
      }
    });
  };

  useEffect(() => {
    cleanCorruptedCartData();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Usuario autenticado:", user.email);
        const adminStatus = await checkAdminRole(user);
        setIsAdmin(adminStatus);
        setUser(user);
        
        // Cargar carrito solo si el usuario está autenticado
        const loadedCart = loadCartFromStorage(user.uid);
        setCartItems(loadedCart);
      } else {
        console.log("No hay usuario autenticado.");
        setUser(null);
        setIsAdmin(false);
        setCartItems([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Persistir carrito cuando cambia
  useEffect(() => {
    if (user) {
      saveCartToStorage(user.uid, cartItems);
    }
  }, [cartItems, user]);

  // Verificar rol de administrador
  const checkAdminRole = async (user) => {
    if (!user) return false;
    try {
      const adminDoc = await getDoc(doc(db, "admins", user.email));
      return adminDoc.exists();
    } catch (error) {
      console.error("Error verificando rol de administrador:", error);
      return false;
    }
  };

  // Agregar producto al carrito
  const addToCart = (product) => {
    if (!isValidCartItem({...product, quantity: 1})) {
      console.error('Producto inválido:', product);
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Limpiar carrito
  const clearCart = () => {
    setCartItems([]);
    if (user) {
      localStorage.removeItem(`cart_${user.uid}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {location.pathname.startsWith('/admin') && user && isAdmin && <AdminNavbar />}
      {!location.pathname.startsWith('/admin') && <Navbar cartItems={cartItems} user={user} />}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/Home" />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/products" element={<Products addToCart={addToCart} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} user={user} />} />
          <Route path="/piedras" element={<Piedras />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route
            path="/cart"
            element={
              user ? (
                <Cart 
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  removeFromCart={removeFromCart}
                  updateQuantity={updateQuantity}
                  user={user}
                />
              ) : (
                <Navigate to="/login" state={{ from: location }} />
              )
            }
          />
          <Route path="/edit-profile" element={<EditProfile user={user} />} />
          <Route path="/checkout" element={<Checkout cartItems={cartItems} clearCart={clearCart} />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          
          {/* Rutas de administrador */}
          <Route 
            path="/admin" 
            element={user && isAdmin ? <AdminPanel /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/products" 
            element={user && isAdmin ? <AdminProducts /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/add-product" 
            element={user && isAdmin ? <AddProduct /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/edit-product/:id" 
            element={user && isAdmin ? <EditProduct /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/add-admin" 
            element={user && isAdmin ? <AddAdmin /> : <Navigate to="/login" />} 
          />
        </Routes>
      </main>

      {!location.pathname.startsWith('/admin') && <Footer />}
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;