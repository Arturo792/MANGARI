import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { reducirStock } from './stock';  // Función que reduce el stock
import { db } from '../firebase';

const PagoExitoso = ({ cartItems, setCartItems }) => {
  const [searchParams] = useSearchParams(); // ✅ debe ir DENTRO del componente
  const paymentId = searchParams.get('payment_id');

  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Recuperamos el carrito desde localStorage si no hay cartItems
  const savedCart = JSON.parse(localStorage.getItem('cartItems')) || [];

  useEffect(() => {
    console.log('paymentId:', paymentId);

    const checkPaymentStatus = async () => {
      // Si cartItems está vacío, usamos el carrito guardado en localStorage
      const carrito = cartItems && cartItems.length ? cartItems : savedCart;

      console.log('carrito:', carrito);

      if (!carrito || !carrito.length) {
        setErrorMessage('El carrito está vacío o no se pudo recuperar.');
        return;
      }

      try {
        const paymentSuccess = await verificarPago(paymentId);

        if (paymentSuccess) {
        //  for (const item of carrito) {
        //    await reducirStock(item.id, item.quantity);
        //  }

          // Limpiamos el carrito de localStorage y de memoria
          localStorage.removeItem('cartItems');
          setCartItems([]);
          setPaymentStatus('Pago confirmado, ¡gracias por tu compra!');
          setTimeout(() => navigate('/productos'), 3000);
        } else {
          setErrorMessage('Hubo un problema con tu pago. Intenta nuevamente.');
        }
      } catch (error) {
        
        for (const item of carrito) {
            console.log("Tipo de carrito:", typeof carrito);
console.log("¿Es array real?", Array.isArray(carrito));
console.log("Contenido real del carrito:", carrito);
console.log("Longitud del carrito:", carrito.length);

            await reducirStock(carrito);
          }
        console.error('Error durante el proceso de pago:', error);
        setErrorMessage('Error al procesar el pago. Intenta nuevamente.');
      }
    };

    checkPaymentStatus();
  }, [cartItems, paymentId, setCartItems, navigate, savedCart]);

  const verificarPago = async (paymentId) => {
    if (!paymentId) return false;

    // Aquí podrías consultar tu backend o la API de MercadoPago
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
