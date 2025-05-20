import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { reducirStock } from './stock';

import { getAuth } from "firebase/auth";

const PagoExitoso = ({ cartItems, setCartItems }) => {
  const effectRan = useRef(false); // Para evitar el warning de useEffect
  const [searchParams] = useSearchParams(); // ✅ debe ir DENTRO del componente
  const paymentId = searchParams.get('payment_id');

  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const savedCart = JSON.parse(localStorage.getItem('cartItems')) || [];

  useEffect(() => {
    if (effectRan.current) return; // Evitar el warning de useEffect
    effectRan.current = true; // Marcar que el efecto ha corrido
    console.log('paymentId:', paymentId);

    const checkPaymentStatus = async () => {
      const carrito = cartItems && cartItems.length ? cartItems : savedCart;

      console.log('carrito:', carrito);

      if (!carrito || !carrito.length) {
        setErrorMessage('El carrito está vacío o no se pudo recuperar.');
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        console.log('Usuario autenticado:', user.uid);
      }

      try {
        const paymentSuccess = await verificarPago(paymentId);
        if (paymentSuccess) {
          for (const item of carrito) {
            if(item.id && item.quantity) {
              console.log(item.quantity, item.id);
              await reducirStock(item.id, item.quantity);
            }
          }

          // Limpiamos el carrito de localStorage y de memoria
          localStorage.removeItem('cartItems');
          setCartItems([]);
          setPaymentStatus('Pago confirmado, ¡gracias por tu compra!');
          //setTimeout(() => navigate('/productos'), 3000);
        } else {
          setErrorMessage('Hubo un problema con tu pago. Intenta nuevamente.');
        }
       
      } catch (error) {
        console.error('Error durante el proceso de pago:', error);
        setErrorMessage('Error al procesar el pago. Intenta nuevamente.');
      }
    };

    checkPaymentStatus();
  }, [paymentId]);

  const verificarPago = async (paymentId) => {
    if (!paymentId) return false;

    return true;  // Simulación por ahora
  };

  return (
    <div className="pago-exitoso-container">
      {paymentStatus && <h1>{paymentStatus}</h1>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default PagoExitoso;
