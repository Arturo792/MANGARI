import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebase';
import '../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar el estado de autenticación al cargar el componente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cerrar sesión al recargar la página
  useEffect(() => {
    const handleBeforeUnload = async () => {
      await signOut(auth); // Cierra la sesión al recargar
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Función para manejar el inicio de sesión
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Iniciar sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Usuario autenticado:", user.email);

      // 2. Verificar si el usuario es un administrador
      const adminDoc = await getDoc(doc(db, "admins", user.email)); // Busca el documento en la colección "admins"
      console.log("Documento de administrador:", adminDoc.data()); // Depuración

      if (adminDoc.exists()) {
        console.log("El usuario es un administrador. Redirigiendo a /admin");
        navigate('/admin'); // Redirige al panel de administrador
      } else {
        console.log("El usuario no es un administrador. Redirigiendo a /home");
        navigate('/home'); // Redirige a la página principal
      }
    } catch (error) {
      // Manejo de errores
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
          setError('El correo o contraseña son incorrectos, verifícalos e intenta de nuevo.');
          break;
      }
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


  if (user) {
    return (
      <div className="login-container">
        <h2>Ya has iniciado sesión</h2>
        <p>Bienvenido, {user.email}</p>
        <button
          onClick={() => navigate('/edit-profile')} // Redirige a /edit-profile
          className="submit-button"
          style={{ backgroundColor: '#BEAEA0', color: '#212121', marginBottom: '10px' }}
        >
          EDITAR PERFIL
        </button>
        <button
          onClick={() => signOut(auth)}
          className="submit-button"
          style={{ backgroundColor: '#BEAEA0', color: '#212121' }}
        >
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
        <button type="submit" className="submit-button" style={{ backgroundColor: '#BEAEA0', color: '#212121' }}>
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