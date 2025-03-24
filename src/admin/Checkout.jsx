import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/checkout.css';

const Checkout = ({ cartItems }) => {
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value,
    });
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };

  const validateCardDetails = () => {
    const { number, expiry, cvc } = cardDetails;

    // Validar número de tarjeta (13 a 19 dígitos)
    if (!/^\d{13,19}$/.test(number)) {
      setError('Número de tarjeta inválido.');
      return false;
    }

    // Validar fecha de expiración (MM/AA)
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError('Fecha de expiración inválida. Usa el formato MM/AA.');
      return false;
    }

    const [month, year] = expiry.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
      setError('La fecha de expiración no es válida.');
      return false;
    }

    // Validar CVV (3 o 4 dígitos)
    if (!/^\d{3,4}$/.test(cvc)) {
      setError('CVV inválido.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validación básica
    if (
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !cardDetails.number ||
      !cardDetails.expiry ||
      !cardDetails.cvc
    ) {
      setError('Por favor, completa todos los campos.');
      setLoading(false);
      return;
    }

    if (!validateCardDetails()) {
      setLoading(false);
      return;
    }

    try {
      // Calcular el monto total
      const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Crear el cuerpo de la solicitud para el backend
      const items = [
        {
          title: 'Compra en Mi Tienda',
          unit_price: totalAmount,
          quantity: 1,
        },
      ];

      const payer = {
        name: shippingAddress.fullName,
        address: {
          street_name: shippingAddress.address,
          city: shippingAddress.city,
          zip_code: shippingAddress.postalCode,
        },
      };

      // Llamar al backend para crear la preferencia
      const response = await fetch('http://localhost:3001/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items, payer }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la preferencia de pago.');
      }

      const { id } = await response.json();

      // Redirigir al usuario a la página de pago de Mercado Pago
      window.location.href = `https://www.mercadopago.com.mx/checkout/v1/redirect?preference-id=${id}`;
    } catch (error) {
      setError('Ocurrió un error al procesar el pago. Inténtalo de nuevo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit}>
        {/* Dirección de envío */}
        <div className="form-group">
          <label>Nombre Completo</label>
          <input
            type="text"
            name="fullName"
            value={shippingAddress.fullName}
            onChange={handleShippingChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            name="address"
            value={shippingAddress.address}
            onChange={handleShippingChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Ciudad</label>
          <input
            type="text"
            name="city"
            value={shippingAddress.city}
            onChange={handleShippingChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Estado</label>
          <input
            type="text"
            name="state"
            value={shippingAddress.state}
            onChange={handleShippingChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Código Postal</label>
          <input
            type="text"
            name="postalCode"
            value={shippingAddress.postalCode}
            onChange={handleShippingChange}
            required
          />
        </div>
        <div className="form-group">
          <label>País</label>
          <input
            type="text"
            name="country"
            value={shippingAddress.country}
            onChange={handleShippingChange}
            required
          />
        </div>

        {/* Detalles de la tarjeta */}
        <div className="form-group">
          <label>Número de Tarjeta</label>
          <input
            type="text"
            name="number"
            value={cardDetails.number}
            onChange={handleCardChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Fecha de Expiración (MM/AA)</label>
          <input
            type="text"
            name="expiry"
            value={cardDetails.expiry}
            onChange={handleCardChange}
            required
          />
        </div>
        <div className="form-group">
          <label>CVV</label>
          <input
            type="text"
            name="cvc"
            value={cardDetails.cvc}
            onChange={handleCardChange}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Procesando...' : 'Pagar'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;