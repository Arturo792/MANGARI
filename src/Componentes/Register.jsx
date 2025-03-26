import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth"; // Importa createUserWithEmailAndPassword
import { auth } from '../firebase'; // Importa auth desde firebase.js
import '../styles/register.css'; 

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirige al carrito con el cupón de bienvenida
      navigate('/cart', { 
        state: { 
          couponCode: 'BIENVENIDO10',
          newUser: true 
        } 
      });
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div className="register-container">
      <button className="close-button" onClick={() => navigate('/')}>
        &times;
      </button>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="input-group">
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="username">Usuario</label>
        </div>

        <div className="input-group">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="email">Correo Electrónico</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="password">Contraseña</label>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="submit-button">
          REGISTRARSE
        </button>
      </form>

      <p className="login-message">
        ¿Ya tienes una cuenta? <Link to="/login" className="login-link">Inicia sesión</Link>
      </p>
    </div>
  );
};

export default Register;