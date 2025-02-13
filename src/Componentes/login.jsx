import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"; 
import { auth } from '../firebase'; 
import '../styles/login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home'); // Redirige a /home después de un inicio de sesión exitoso
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError('El correo electrónico no está registrado.');
          break;
        case 'auth/wrong-password':
          setError('La contraseña es incorrecta.');
          break;
        case 'auth/invalid-email':
          setError('El correo electrónico no es válido.');
          break;
        default:
          setError('El correo o contraseña son incorrectos, verificalos e intenta de nuevo.');
          break;
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cierra la sesión del usuario
      navigate('/'); // Redirige al usuario a la página principal
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Si la aplicación está cargando, mostrar un mensaje de carga
  if (loading) {
    return (
      <div className="login-container">
        <p>Cargando...</p>
      </div>
    );
  }

  // Si el usuario ya está autenticado, mostrar un mensaje y un botón para cerrar sesión
  if (user) {
    return (
      <div className="login-container">
        <h2>Ya has iniciado sesión</h2>
        <p>Bienvenido, {user.email}</p>
        <button onClick={handleLogout} className="submit-button">
          CERRAR SESIÓN
        </button>
      </div>
    );
  }

  // Si el usuario no está autenticado, mostrar el formulario de inicio de sesión
  return (
    <div className="login-container">
      <button className="close-button" onClick={() => navigate('/')}>
        &times;
      </button>

      <form onSubmit={handleSubmit} className="login-form">
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
          INICIAR SESIÓN
        </button>
      </form>

      <p className="register-message">
        ¿Aún no tienes cuenta? <Link to="/Register" className="register-link">Regístrate</Link>
      </p>
    </div>
  );
};

export default Login;