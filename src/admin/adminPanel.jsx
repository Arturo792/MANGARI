import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/adminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Verificar si el usuario es un administrador
        const adminDoc = await getDoc(doc(db, "admins", user.email));
        if (adminDoc.exists()) {
          setIsAdmin(true);
        } else {
          // Si no es administrador, redirige a la página principal
          navigate('/home');
        }
      } else {
        // Si no está autenticado, redirige a la página de inicio de sesión
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAdmin) {
    return <div>No tienes permisos para acceder a esta página.</div>;
  }

  return (
    <div className="admin-container">
      <h1>Panel de Administrador</h1>
      <button onClick={() => auth.signOut()} className="logout-button">
        Cerrar Sesión
      </button>

     
    </div> 
  );
};

export default AdminPanel;