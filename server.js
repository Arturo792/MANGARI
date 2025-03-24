const express = require('express');
const mercadopago = require('mercadopago');
const app = express();

// Configura Mercado Pago con tu access_token (versión 2.x.x)
mercadopago.configure({
  access_token: 'APP_USR-757415436502648-032114-58c545754dffd32621b9f2c75d23e808-2341813145', // 👈 Reemplaza con tu access_token
});

// Middleware para parsear JSON
app.use(express.json());

// Ruta para crear una preferencia de pago
app.post('/create-preference', async (req, res) => {
  const { items, payer } = req.body;

  try {
    const preference = {
      items,
      payer,
      back_urls: {
        success: 'http://localhost:3000/success', // 👈 URL de éxito (cambia por tu dominio)
        failure: 'http://localhost:3000/failure', // 👈 URL de fallo (cambia por tu dominio)
        pending: 'http://localhost:3000/pending', // 👈 URL de pago pendiente (cambia por tu dominio)
      },
      auto_return: 'approved', // Redirige automáticamente al usuario después del pago
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la preferencia de pago' });
  }
});

// Ruta para manejar el éxito del pago
app.get('/success', (req, res) => {
  res.send('¡Pago exitoso!');
});

// Ruta para manejar el fallo del pago
app.get('/failure', (req, res) => {
  res.send('Pago fallido. Inténtalo de nuevo.');
});

// Ruta para manejar pagos pendientes
app.get('/pending', (req, res) => {
  res.send('Pago pendiente. Espera la confirmación.');
});

// Iniciar el servidor
app.listen(3001, () => {
  console.log('Servidor backend corriendo en http://localhost:3001');
});