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
import Nosotros from './Componentes/Nosotros';
import Footer from './Componentes/Footer';
import AdminPanel from './Componentes/adminPanel';
import AdminNavbar from './Componentes/adminNavbar';
import AddProduct from './Componentes/addProduct';
import AdminProducts from './Componentes/adminProducts';
import EditProduct from './Componentes/editProduct';
import AddAdmin from './Componentes/addAdmin';
import './App.css';

const App = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Usuario autenticado:", user.email);
        const isAdmin = await checkAdminRole(user);
        console.log("¿Es administrador?", isAdmin);
        setUser(user);
      } else {
        console.log("No hay usuario autenticado.");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkAdminRole = async (user) => {
    if (!user) return false;
    try {
      const adminDoc = await getDoc(doc(db, "admins", user.email)); // Verifica el rol del usuario
      return adminDoc.exists();
    } catch (error) {
      console.error("Error verificando rol de administrador:", error);
      return false;
    }
  };

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
    <div>
      {location.pathname.startsWith('/admin') && user && <AdminNavbar />}
      {!location.pathname.startsWith('/admin') && <Navbar cartItems={cartItems} />}

      <Routes>
        <Route path="/" element={<Navigate to="/Home" />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/products" element={<Products addToCart={addToCart} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
        <Route path="/admin/edit-product/:id" element={<EditProduct />} />
        <Route
          path="/cart"
          element={
            user ? (
              <Cart cartItems={cartItems} setCartItems={setCartItems} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/piedras" element={<Piedras />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route
          path="/admin"
          element={
            user && checkAdminRole(user) ? (
              <AdminPanel />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/add-product"
          element={
            user && checkAdminRole(user) ? (
              <AddProduct />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/products"
          element={
            user && checkAdminRole(user) ? (
              <AdminProducts />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/add-admin"
          element={
            user && checkAdminRole(user) ? (
              <AddAdmin />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      <Footer />
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;