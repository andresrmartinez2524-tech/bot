const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

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

// 📱 QR
client.on('qr', qr => {
  console.log('Escanea este QR 🔐');
  qrcode.generate(qr, { small: true });
});

// 🚀 Bot listo
client.on('ready', () => {
  console.log('Bot listo ✅');

  // ===== MENSAJES DIARIOS =====

  cron.schedule('0 8 * * *', () => {
    enviar("Amor, recuerda los probióticos 💊");
  });

  cron.schedule('0 9 * * *', () => {
    enviar("Amor, hora de ir al gym 💪");
  });

  cron.schedule('0 10 * * *', () => {
    enviar("Amor, hora de desayunar ☕");
  });

  cron.schedule('0 13 * * *', () => {
    enviar("Amor, almuerzo ❤️");
  });

  cron.schedule('0 21 * * *', () => {
    enviar("Amor, hora de comer ❤️");
  });

  cron.schedule('0 22 * * *', () => {
    enviar("Amor, no olvides las pastillitas 💊");
  });

  // ===== RECORDATORIOS MENSUALES =====

  cron.schedule('0 9 26 * *', () => {
    enviar("Amor, recuerda enviar la cuenta de cobro 📄");
  });

  cron.schedule('0 9 4 * *', () => {
    enviar("Amor, pagarle a Sols $29.000 💸");
  });

  cron.schedule('0 9 30 * *', () => {
    enviar("Amor, pagar tarjetas 💳");
  });

});

// 💌 Función para enviar mensajes
function enviar(texto) {
  client.sendMessage('573102900407@c.us', texto);
}

// ▶️ iniciar bot
client.initialize();