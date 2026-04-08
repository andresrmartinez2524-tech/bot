const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const qrcodeImage = require('qrcode'); // Para generar la imagen real
const cron = require('node-cron');
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuración del Cliente
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  }
});

// 📱 Manejo del QR
client.on('qr', async (qr) => {
  console.log('Nuevo QR generado 🔐');
  
  // 1. Lo sigue mostrando en consola (por si acaso)
  qrcodeTerminal.generate(qr, { small: true });

  // 2. Guarda el QR como imagen para ver en el navegador
  try {
    await qrcodeImage.toFile(path.join(__dirname, 'qr.png'), qr);
    console.log('QR guardado como imagen. Míralo en: /ver-qr');
  } catch (err) {
    console.error('Error al guardar el QR:', err);
  }
});

// 🚀 Bot listo
client.on('ready', () => {
  console.log('Bot listo ✅');

  // ===== MENSAJES DIARIOS =====
  cron.schedule('0 8 * * *', () => enviar("Amor, recuerda los probióticos 💊"));
  cron.schedule('0 9 * * *', () => enviar("Amor, hora de ir al gym 💪"));
  cron.schedule('0 10 * * *', () => enviar("Amor, hora de desayunar ☕"));
  cron.schedule('0 13 * * *', () => enviar("Amor, almuerzo ❤️"));
  cron.schedule('0 21 * * *', () => enviar("Amor, hora de comer ❤️"));
  cron.schedule('0 22 * * *', () => enviar("Amor, no olvides las pastillitas 💊"));

  // ===== RECORDATORIOS MENSUALES =====
  cron.schedule('0 9 26 * *', () => enviar("Amor, recuerda enviar la cuenta de cobro 📄"));
  cron.schedule('0 9 4 * *', () => enviar("Amor, pagarle a Sols $29.000 💸"));
  cron.schedule('0 9 30 * *', () => enviar("Amor, pagar tarjetas 💳"));
});

// 💌 Función para enviar mensajes
function enviar(texto) {
  client.sendMessage('573102900407@c.us', texto);
}

// 🌐 Servidor Express para ver el QR
app.get('/ver-qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.png'));
});

app.get('/', (req, res) => {
  res.send('Bot funcionando 🚀. Ve a /ver-qr para escanear.');
});

app.listen(port, () => {
  console.log(`Servidor web corriendo en puerto ${port}`);
});

// ▶️ Iniciar bot
client.initialize();