import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../styles/adminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="admin-container">
      <h1>Panel de Administrador</h1>
      <button onClick={handleLogout} className="logout-button">
        Cerrar Sesión
      </button>

      <div className="admin-options">
        <button
          className="admin-option-button"
          onClick={() => navigate('/admin/add-product')}
        >
          Agregar Producto
        </button>

        <button
          className="admin-option-button"
          onClick={() => navigate('/admin/products')}
        >
          Ver Productos
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;