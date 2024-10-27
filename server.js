// Import dependencies
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');  // Needed to serve static files
require('dotenv').config();  // Load environment variables from the .env file

const app = express();
const port = 3000;

// Middleware to serve static files (such as index.html, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer configuration using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Environment variable
    pass: process.env.PASSWORD // Environment variable
  }
});

// Middleware to parse JSON
app.use(express.json());  // Recommended to use express.json() for modern versions

// Route to handle email sending
app.post('/send-email', (req, res) => {
  const { email1, email2, message } = req.body;
  const mailOptions = {
    from: process.env.EMAIL, // Use the email from environment variables
    to: `${email1}, ${email2}`, // Recipients
    subject: 'Notification about your event', // Subject
    text: message // Email body
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error); // Print the error on the server console
      return res.status(500).send('Error sending email: ' + error.toString());
    }
    res.status(200).send('Email sent: ' + info.response);
  });
});

// Route to handle all GET requests (including "/")
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server on port 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});