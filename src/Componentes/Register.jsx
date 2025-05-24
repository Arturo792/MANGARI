import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../firebase';
import '../styles/register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validaciones básicas
    if (!username || !email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Normalizar el email para usarlo como ID de documento
      const normalizedEmail = email.trim().toLowerCase();

      // 2. Guardar información en Firestore usando el email como ID del documento
      await setDoc(doc(db, "users", normalizedEmail), {
        uid: user.uid, // Guardamos también el UID para referencias
        username: username.trim(),
        email: normalizedEmail,
        createdAt: new Date(),
        role: "user",
        favorites: [],
        cart: []
      });

      // Redirige al carrito con el cupón de bienvenida
      navigate('/cart', { 
        state: { 
          couponCode: 'BIENVENIDO10',
          newUser: true 
        } 
      });

    } catch (error) {
      let errorMessage = 'Error al registrar el usuario';
      
      switch(error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'El correo electrónico ya está en uso';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es demasiado débil';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');

    if (!resetEmail) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(`Se ha enviado un correo a ${resetEmail} con instrucciones para restablecer tu contraseña.`);
      setResetEmail('');
      setTimeout(() => setShowResetPassword(false), 3000);
    } catch (error) {
      let errorMessage = 'Error al enviar el correo de recuperación';
      
      switch(error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo electrónico';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <button className="close-button" onClick={() => navigate('/')}>
        &times;
      </button>

      {!showResetPassword ? (
        <>
          <h2 className="register-title">Crear Cuenta</h2>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-group">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
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
                autoComplete="email"
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
                autoComplete="new-password"
                minLength="6"
              />
              <label htmlFor="password">Contraseña (mínimo 6 caracteres)</label>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'REGISTRARSE'}
            </button>

            
          </form>
          
          <p className="login-message">
            ¿Ya tienes una cuenta? <Link to="/login" className="login-link">Inicia sesión</Link>
          </p>

          <button 
            className="forgot-password-button"
            onClick={() => setShowResetPassword(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </>
      ) : (
        <>
          <h2 className="register-title">Recuperar Contraseña</h2>

          <form onSubmit={handlePasswordReset} className="register-form">
            <div className="input-group">
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <label htmlFor="resetEmail">Correo Electrónico</label>
            </div>

            {error && <p className="error-message">{error}</p>}
            {resetSuccess && <p className="success-message">{resetSuccess}</p>}

            <div className="button-group">
              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'ENVIAR INSTRUCCIONES'}
              </button>
              
              <button 
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowResetPassword(false);
                  setError('');
                  setResetSuccess('');
                }}
                disabled={isLoading}
              >
                Cancelar
              </button>
            </div>
          </form>

          <p className="login-message">
            ¿No tienes una cuenta? <Link to="/register" className="login-link">Regístrate</Link>
                

          </p>
        </>
      )}
    </div>
  );
};

export default Register;