import React, { useState } from 'react';
import '../styles/CardPaymentForm.css';

const CardPaymentForm = ({ onSubmit, onCancel, loading }) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});

  const validateCard = () => {
    const newErrors = {};
    if (!cardData.cardNumber.match(/^\d{16}$/)) newErrors.cardNumber = 'Número inválido';
    if (!cardData.cardName.trim()) newErrors.cardName = 'Nombre requerido';
    if (!cardData.expiryDate.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) newErrors.expiryDate = 'MM/YY inválido';
    if (!cardData.cvv.match(/^\d{3,4}$/)) newErrors.cvv = 'CVV inválido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCard()) return;
    
    try {
      const mp = await loadMercadoPago();
      
      const token = await mp.createCardToken({
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        cardholderName: cardData.cardName,
        cardExpirationMonth: cardData.expiryDate.split('/')[0],
        cardExpirationYear: cardData.expiryDate.split('/')[1],
        securityCode: cardData.cvv
      });

      onSubmit({
        token: token.id,
        payment_method_id: cardData.cardNumber.startsWith('4') ? 'visa' : 'master',
        installments: 1,
        identification_type: 'DNI',
        identification_number: '12345678'
      });

    } catch (error) {
      console.error('Error tokenizando tarjeta:', error);
      setErrors({ form: 'Error al procesar la tarjeta. Verifica los datos.' });
    }
  };

  const loadMercadoPago = () => {
    return new Promise((resolve) => {
      if (window.MercadoPago) {
        const mp = new window.MercadoPago(process.env.REACT_APP_MP_PUBLIC_KEY);
        return resolve(mp);
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        const mp = new window.MercadoPago(process.env.REACT_APP_MP_PUBLIC_KEY);
        resolve(mp);
      };
      document.body.appendChild(script);
    });
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="card-payment-form">
      <h3>Información de Tarjeta</h3>
      <form onSubmit={handleSubmit}>
        {/* ... resto del formulario ... */}
      </form>
    </div>
  );
};

export default CardPaymentForm;