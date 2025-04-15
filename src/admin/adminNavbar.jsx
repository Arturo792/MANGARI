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
          <Link to="/admin/products" className="admin-navbar-link">
            Ver Productos
          </Link>
        </li>
        <li>
          <Link to="/admin/piedras" className="admin-navbar-link">
            Administrar Piedras
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;