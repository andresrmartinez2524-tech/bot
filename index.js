const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const qrcodeImage = require('qrcode');
const cron = require('node-cron');
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de zona horaria (IMPORTANTE para que den las horas en Colombia)
const zonacol = { timezone: "America/Bogota" };

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});

let qrGenerado = false;

client.on('qr', async (qr) => {
  if (qrGenerado) return;
  qrGenerado = true;
  console.log('Escanea el QR en /ver-qr 🔐');
  qrcodeTerminal.generate(qr, { small: true });
  try {
    await qrcodeImage.toFile(path.join(__dirname, 'qr.png'), qr);
  } catch (err) {
    console.error('Error al guardar QR:', err);
  }
});

client.on('ready', () => {
  console.log('Bot listo ✅');
  
  // Borré el mensaje de prueba de aquí para que no te sature cada vez que el bot reinicie.
  // Pero ya sabemos que funciona.

  // ===== MENSAJES DIARIOS (Con zona horaria corregida) =====
  cron.schedule('0 8 * * *', () => enviar("Amor, recuerda los probióticos 💊"), zonacol);
  cron.schedule('0 9 * * *', () => enviar("Amor, hora de ir al gym 💪"), zonacol);
  cron.schedule('0 10 * * *', () => enviar("Amor, hora de desayunar ☕"), zonacol);
  cron.schedule('0 13 * * *', () => enviar("Amor, almuerzo ❤️"), zonacol);

  // 🕕 6:15 PM (Corregido de 25 a 18 horas)
  cron.schedule('40 18 * * *', () => enviar("Hola amor soy una IA"), zonacol);

  cron.schedule('0 21 * * *', () => enviar("Amor, hora de comer ❤️"), zonacol);
  cron.schedule('0 22 * * *', () => enviar("Amor, no olvides las pastillitas 💊"), zonacol);

  // ===== RECORDATORIOS MENSUALES =====
  cron.schedule('0 9 26 * *', () => enviar("Amor, recuerda enviar la cuenta de cobro 📄"), zonacol);
  cron.schedule('0 9 4 * *', () => enviar("Amor, pagarle a Sols $29.000 💸"), zonacol);
  cron.schedule('0 9 30 * *', () => enviar("Amor, pagar tarjetas 💳"), zonacol);
});

function enviar(texto) {
  client.sendMessage('573102900407@c.us', texto)
    .then(() => console.log(`Mensaje enviado: ${texto}`))
    .catch(err => console.error('Error al enviar:', err));
}

app.get('/ver-qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.png'));
});

app.get('/', (req, res) => {
  res.send('Bot funcionando 🚀 Ve a /ver-qr para escanear');
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

client.initialize();