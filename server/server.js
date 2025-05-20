require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Configuración
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const MP_API_URL = 'https://api.mercadopago.com';

const allowedOrigins = [
  FRONTEND_URL, // http://localhost:3000
  'http://localhost:3000' // la URL que te da ngrok
];
// Middlewares
app.use(cors({
  origin: function(origin, callback) {
    // Permite peticiones sin origen (Postman, curl, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `El CORS no está permitido para el origen: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

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

// Validación de datos del comprador
const validatePayer = (payer) => {
  return (
    payer &&
    payer.name &&
    payer.email &&
    /^\S+@\S+\.\S+$/.test(payer.email) &&
    payer.phone?.number &&
    payer.address?.street_name &&
    payer.address?.zip_code
  );
};

// Crear headers para las peticiones a MP
const getMPHeaders = () => ({
  'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'X-Integrator-ID': process.env.MP_INTEGRATOR_ID || ''
});

// Ruta para crear preferencia de MercadoPago (redirección)
app.post('/create-preference', async (req, res) => {
  try {
    const { items, payer, metadata, back_urls } = req.body;

    if (!validateItems(items)) {
      return res.status(400).json({ error: 'Items inválidos' });
    }

    if (!validatePayer(payer)) {
      return res.status(400).json({ error: 'Datos del comprador inválidos' });
    }

    const preference = {
      items: items.map(item => ({
        id: item.id,
        title: item.title.substring(0, 50),
        unit_price: item.unit_price,
        quantity: item.quantity,
        ...(item.picture_url && { picture_url: item.picture_url })
      })),
      payer: {
        name: payer.name,
        surname: payer.surname || '', // MP requiere surname
        email: payer.email,
        phone: {
          area_code: '', // Extraer de phone.number si es posible
          number: payer.phone.number
        },
        address: {
          zip_code: payer.address.zip_code,
          street_name: payer.address.street_name,
          street_number: 'N/A' // MP requiere street_number
        }
      },
      back_urls: req.body.back_urls || {
        success: `${FRONTEND_URL}/pago-exitoso`,
        failure: `${FRONTEND_URL}/pago-fallido`,
        pending: `${FRONTEND_URL}/pago-pendiente`
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [{ id: 'atm' }], // Opcional: excluir métodos
        installments: 12 // Máximo de cuotas
      },
      metadata: metadata || {},
      notification_url: process.env.MP_NOTIFICATION_URL // Para webhooks
    };

    const response = await axios.post(
      `${MP_API_URL}/checkout/preferences`,
      preference,
      { headers: getMPHeaders() }
    );

    res.json({
      id: response.data.id,
      init_point: response.data.init_point,
      sandbox_init_point: response.data.sandbox_init_point // Para desarrollo
    });

  } catch (error) {
    console.error('Error MercadoPago:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error al crear el pago',
      details: process.env.NODE_ENV === 'development' ? error.response?.data : null
    });
  }
});

// Ruta para procesar pagos directos con tarjeta
app.post('/process-payment', async (req, res) => {
  try {
    const { items, payer, payment_method, metadata } = req.body;

    if (!validateItems(items)) {
      return res.status(400).json({ error: 'Items inválidos' });
    }

    if (!validatePayer(payer)) {
      return res.status(400).json({ error: 'Datos del comprador inválidos' });
    }

    if (!payment_method?.token || !payment_method?.payment_method_id) {
      return res.status(400).json({ error: 'Datos de pago inválidos' });
    }

    const paymentData = {
      transaction_amount: items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
      token: payment_method.token,
      description: `Compra de ${items.length} productos`,
      installments: Number(payment_method.installments) || 1,
      payment_method_id: payment_method.payment_method_id,
      payer: {
        email: payer.email,
        identification: {
          type: payment_method.identification_type || 'DNI',
          number: payment_method.identification_number || '12345678'
        }
      },
      metadata: metadata || {}
    };

    const response = await axios.post(
      `${MP_API_URL}/v1/payments`,
      paymentData,
      { headers: getMPHeaders() }
    );

    if (response.data.status !== 'approved') {
      return res.status(400).json({ 
        error: 'Pago no aprobado',
        status: response.data.status,
        status_detail: response.data.status_detail
      });
    }

    res.json({
      id: response.data.id,
      status: response.data.status,
      payment_method: response.data.payment_method_id,
      card: response.data.card,
      receipt_url: response.data.receipt_url
    });

  } catch (error) {
    console.error('Error en pago con tarjeta:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error al procesar el pago con tarjeta',
      details: process.env.NODE_ENV === 'development' ? error.response?.data : null
    });
  }
});

// Ruta para tokenizar tarjeta (seguridad - debe hacerse en frontend con MercadoPago.js)
app.post('/tokenize-card', async (req, res) => {
  try {
    // NOTA: Esta operación DEBE hacerse en el frontend por seguridad PCI
    // Solo incluyo esto como ejemplo conceptual
    const { cardData } = req.body;
    
    const response = await axios.post(
      `${MP_API_URL}/v1/card_tokens`,
      {
        card_number: cardData.cardNumber,
        security_code: cardData.cvv,
        expiration_month: cardData.expiryDate.split('/')[0],
        expiration_year: cardData.expiryDate.split('/')[1],
        cardholder: {
          name: cardData.cardName,
          identification: {
            type: 'DNI',
            number: '12345678' // Deberías obtener esto del formulario
          }
        }
      },
      { headers: getMPHeaders() }
    );

    res.json({
      token: response.data.id,
      card: response.data
    });

  } catch (error) {
    console.error('Error tokenizando tarjeta:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error al tokenizar la tarjeta',
      details: process.env.NODE_ENV === 'development' ? error.response?.data : null
    });
  }
});

// Ruta para verificar estado de pago
app.get('/payment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `${MP_API_URL}/v1/payments/${id}`,
      { headers: getMPHeaders() }
    );

    res.json({
      id: response.data.id,
      status: response.data.status,
      status_detail: response.data.status_detail,
      payment_method: response.data.payment_method_id,
      amount: response.data.transaction_amount,
      date_approved: response.data.date_approved
    });

  } catch (error) {
    console.error('Error al verificar pago:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error al verificar el pago',
      details: process.env.NODE_ENV === 'development' ? error.response?.data : null
    });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV || 'development',
    mp_configured: !!MP_ACCESS_TOKEN
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ruta para recibir notificaciones (webhook) de Mercado Pago
app.post('/webhook', (req, res) => {
  console.log('🔔 Notificación recibida de Mercado Pago:', req.body);

  // Aquí puedes procesar la notificación para actualizar el estado en tu BD, enviar emails, etc.
  // Por ejemplo:
  // const topic = req.body.type; // 'payment', 'merchant_order', etc.
  // const paymentId = req.body.data?.id;

  // Responder con status 200 para confirmar recepción
  res.status(200).send('Webhook recibido correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
  console.log(`Configurado para FRONTEND: ${FRONTEND_URL}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Permitiendo CORS para: ${allowedOrigins.join(', ')}`);
});


//Prueba de seguridad 4