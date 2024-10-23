// Importar dependencias
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');  // Necesario para servir archivos estáticos
require('dotenv').config();  // Cargar variables de entorno desde el archivo .env

const app = express();
const port = 3000;

// Middleware para servir archivos estáticos (como index.html, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Nodemailer utilizando variables de entorno
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Variable de entorno
    pass: process.env.PASSWORD // Variable de entorno
  }
});

// Middleware para parsear JSON
app.use(bodyParser.json());

// Ruta para manejar el envío de correos electrónicos
app.post('/send-email', (req, res) => {
  const { email1, email2, message } = req.body;
  const mailOptions = {
    from: process.env.EMAIL, // Usar el email desde las variables de entorno
    to: `${email1}, ${email2}`, // Destinatarios
    subject: 'Notification about your event', // Asunto
    text: message // Cuerpo del correo
  };

  // Enviar el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error); // Imprimir el error en la consola del servidor
      return res.status(500).send('Error al enviar el correo: ' + error.toString());
    }
    res.status(200).send('Correo enviado: ' + info.response);
  });
});

// Ruta para manejar todos los GET (incluyendo "/")
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});