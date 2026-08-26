import express from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno desde .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar trust proxy para obtener la IP real del cliente detrás del proxy inverso de Hostinger / Nginx
app.set('trust proxy', 1);

// Middleware para parsear payloads JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Limitador de tasa (Rate Limiting) para la API de contacto:
// Máximo 5 peticiones cada 15 minutos por IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: {
    success: false,
    message: 'Has superado el límite de intentos (5 cada 15 min). Por favor, reintenta más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Endpoint POST /api/contacto
app.post('/api/contacto', contactLimiter, async (req, res) => {
  try {
    const { nombre, email, mensaje, website_url } = req.body;

    // Validación de trampa antispam (Honeypot):
    // Si el campo señuelo 'website_url' contiene algún valor, asumimos que es un bot.
    // Respondemos con HTTP 200 ficticio sin procesar el envío del correo.
    if (website_url && website_url.trim() !== '') {
      console.warn('Trampa Honeypot activada. Petición omitida silenciosamente.');
      return res.status(200).json({
        success: true,
        message: 'Mensaje enviado correctamente.'
      });
    }

    // Validación de campos obligatorios en el servidor
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, completa todos los campos requeridos (nombre, email, mensaje).'
      });
    }

    // Validación simple de formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato de correo electrónico proporcionado no es válido.'
      });
    }

    // Configurar transporte SMTP de Nodemailer con variables de entorno
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true', // true para puerto 465, false para otros
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Contenido del email
    const recipientEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
    const mailOptions = {
      from: `"Formulario Web" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `[Contacto Web] Nuevo mensaje de ${nombre}`,
      text: `Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #e4e4e7; padding-bottom: 10px; margin-top: 0;">Nuevo Mensaje de Contacto</h2>
          <p style="margin: 10px 0;"><strong>Nombre:</strong> ${nombre}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #4f46e5;">${email}</a></p>
          <div style="margin-top: 20px;">
            <strong>Mensaje:</strong>
            <p style="background-color: #f4f4f5; padding: 15px; border-radius: 6px; white-space: pre-wrap; color: #27272a; margin-top: 8px;">${mensaje}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
          <span style="font-size: 12px; color: #71717a;">Enviado automáticamente desde el formulario web de tu sitio en Hostinger.</span>
        </div>
      `,
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: '¡Gracias por contactarnos! Tu mensaje ha sido enviado exitosamente.'
    });

  } catch (error) {
    console.error('Error al enviar el email mediante SMTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error al intentar enviar tu mensaje. Por favor, intenta de nuevo más tarde.'
    });
  }
});

// Servir archivos estáticos generados por la compilación de Vite (/client/dist)
const distPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(distPath));

// Soporte SPA: Redirigir cualquier otra petición GET no reconocida al index.html de Vite
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Iniciar servidor HTTP
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo archivos estáticos desde: ${distPath}`);
  console.log(`====================================================`);
});
