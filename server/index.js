const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDatabase } = require("./config/mongodb");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 8080;

// MongoDB connection
connectDatabase();

// Define MongoDB schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Contact = mongoose.model('Contact', contactSchema);

// Middleware
app
  .use(cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      "https://www.cacsjs.com",
    ],
    credentials: true,
  }))
  .set("x-powered-by", false)
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running...",
  });
});

// Contact form submission endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    // Save the message to MongoDB
    const newMessage = new Contact({ name, email, phone, message });
    await newMessage.save();

    // Send email notification
    await sendEmailNotification(name, email, phone, message);

    res.status(200).json({ message: 'Message stored and email sent successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to send email notification
async function sendEmailNotification(name, email, phone, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smpt.gmail.com',
    auth: {
      user: 'joydarven@gmail.com',
      pass: '#darven1384',
    },
  });

  const mailOptions = {
    from: 'joydarven@gmail.com',
    to: 'srijansinha3@gmail.com',
    subject: 'New Contact Form Submission',
    html: `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

app.listen(PORT, () => {
  console.log(`
  ************************************************************
                    Listening on port: ${PORT}
                    http://localhost:${PORT}
  ************************************************************`);
});
