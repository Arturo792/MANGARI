// AdminNavbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/adminNavbar.css';

const AdminNavbar = () => {
  return (
    <nav className="admin-navbar">
      <ul className="admin-navbar-list">
        <li>
          <Link to="/admin" className="admin-navbar-link">
            Panel de Administrador
          </Link>
        </li>
        <li>
          <Link to="/admin/add-product" className="admin-navbar-link">
            Agregar Producto
          </Link>
        </li>
        <li>
          <Link to="/adminProducts" className="admin-navbar-link">
            Ver Productos
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;