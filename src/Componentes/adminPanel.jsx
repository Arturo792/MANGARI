// AdminPanel.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../styles/admin.css'; 

const AdminPanel = () => {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');

    // Aquí puedes agregar la lógica para subir el producto a Firestore o tu base de datos
    console.log("Producto agregado:", { productName, productPrice });
    alert("Producto agregado correctamente.");
  };

  return (
    <div className="admin-container">
      <h1>Panel de Administrador</h1>
      <button onClick={handleLogout} className="logout-button">
        Cerrar Sesión
      </button>

      <form onSubmit={handleAddProduct} className="admin-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <input
            type="number"
            placeholder="Precio del producto"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="submit-button">
          Agregar Producto
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;