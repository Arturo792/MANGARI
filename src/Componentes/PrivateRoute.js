import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

const PrivateRoute = ({ children }) => {
  const user = auth.currentUser; // Verifica si hay un usuario autenticado
  return user ? children : <Navigate to="/login" />; // Redirige al login si no está autenticado
};

export default PrivateRoute;