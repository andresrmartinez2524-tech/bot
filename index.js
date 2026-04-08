const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const qrcodeImage = require('qrcode');
const cron = require('node-cron');
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 🔥 Cliente con sesión guardada (CLAVE)
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

// 🔐 Control para evitar QR infinito
let qrGenerado = false;

// 📱 Manejo del QR
client.on('qr', async (qr) => {
  if (qrGenerado) return;
  qrGenerado = true;

  console.log('Escanea el QR en /ver-qr 🔐');

  // Consola
  qrcodeTerminal.generate(qr, { small: true });

  // Imagen para navegador
  try {
    await qrcodeImage.toFile(path.join(__dirname, 'qr.png'), qr);
  } catch (err) {
    console.error('Error al guardar QR:', err);
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

  // 🕕 6:15 PM
  cron.schedule('15 25 * * *', () => 
    enviar("Hola amor soy una IA")
  );

  cron.schedule('0 21 * * *', () => enviar("Amor, hora de comer ❤️"));
  cron.schedule('0 22 * * *', () => enviar("Amor, no olvides las pastillitas 💊"));

  // ===== RECORDATORIOS MENSUALES =====
  cron.schedule('0 9 26 * *', () => enviar("Amor, recuerda enviar la cuenta de cobro 📄"));
  cron.schedule('0 9 4 * *', () => enviar("Amor, pagarle a Sols $29.000 💸"));
  cron.schedule('0 9 30 * *', () => enviar("Amor, pagar tarjetas 💳"));
});

// 💌 Función de envío
function enviar(texto) {
  client.sendMessage('573102900407@c.us', texto);
}

// 🌐 Ver QR en navegador
app.get('/ver-qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.png'));
});

app.get('/', (req, res) => {
  res.send('Bot funcionando 🚀 Ve a /ver-qr para escanear el QR');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

// ▶️ iniciar
client.initialize();