import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Products from './Componentes/Products';
import Navbar from './Componentes/Navbar';
import Login from './Componentes/login';
import Register from './Componentes/Register';
import ProductDetail from './Componentes/ProductDetail';
import Cart from './Componentes/Cart';
import Home from './Componentes/Home';
import Piedras from './Componentes/Piedras';
import Nosotros from './Componentes/Nosotros';
import Footer from './Componentes/Footer';
import PrivateRoute from './Componentes/PrivateRoute'; 

const App = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addToCart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <Router>
      <div>
        <Navbar cartItems={cartItems} />
        <Routes>
          <Route path="/" element={<Navigate to="/Home" />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/products" element={<Products addToCart={addToCart} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <Cart cartItems={cartItems} setCartItems={setCartItems} />
              </PrivateRoute>
            }
          />
          <Route path="/piedras" element={<Piedras />} /> 
          <Route path="/nosotros" element={<Nosotros />} /> 
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;