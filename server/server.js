require('dotenv').config();
const express = require('express');
const axios = require('axios'); // Para peticiones HTTP
const cors = require('cors');
const app = express();

// Configuración
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

// Middlewares
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Validación de items
const validateItems = (items) => {
  if (!Array.isArray(items)) return false;
  return items.every(item => (
    item.title &&
    typeof item.unit_price === 'number' &&
    item.unit_price > 0 &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  ));
};

// Ruta principal
app.post('/create-preference', async (req, res) => {
  try {
    const { items, payer } = req.body;

    if (!validateItems(items)) {
      return res.status(400).json({ error: 'Items inválidos' });
    }

    const preference = {
      items: items.map(item => ({
        title: item.title.substring(0, 50),
        unit_price: item.unit_price,
        quantity: item.quantity,
        ...(item.img && { picture_url: item.img })
      })),
      payer,
      back_urls: {
        success: `${FRONTEND_URL}/pago-exitoso`,
        failure: `${FRONTEND_URL}/pago-fallido`,
        pending: `${FRONTEND_URL}/pago-pendiente`
      },
      auto_return: 'approved'
    };

    // Llamada DIRECTA a la API de MercadoPago
    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preference,
      {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      id: response.data.id,
      init_point: response.data.init_point
    });

  } catch (error) {
    console.error('Error MercadoPago:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error al crear el pago',
      details: process.env.NODE_ENV === 'development' ? error.response?.data : null
    });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', environment: process.env.NODE_ENV || 'development' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});