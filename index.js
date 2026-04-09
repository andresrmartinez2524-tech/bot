const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const qrcodeImage = require('qrcode');
const cron = require('node-cron');
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

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
let isReady = false; // Nueva bandera para saber si el bot está conectado

client.on('qr', async (qr) => {
    // Si ya estamos listos, no necesitamos generar más QRs
    if (isReady) return; 
    
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
    isReady = true;
    
    // ===== MENSAJES DIARIOS =====
    cron.schedule('0 8 * * *', () => enviar("Amor, recuerda los probióticos 💊"), zonacol);
    cron.schedule('0 9 * * *', () => enviar("Amor, hora de ir al gym 💪"), zonacol);
    cron.schedule('0 10 * * *', () => enviar("Amor, hora de desayunar ☕"), zonacol);
    cron.schedule('0 13 * * *', () => enviar("Amor, almuerzo ❤️"), zonacol);
    cron.schedule('0 21 * * *', () => enviar("Amor, hora de comer ❤️"), zonacol);
      cron.schedule('30 21 * * *', () => enviar("Amor, hora de comer ❤️"), zonacol);
        cron.schedule('32 21 * * *', () => enviar("Amor, hora de comer ❤️"), zonacol);
          cron.schedule('34 21 * * *', () => enviar("Amor, hora de comer ❤️"), zonacol);
            cron.schedule('36 21 * * *', () => enviar("Amor, hora de comer ❤️"), zonacol);
    cron.schedule('0 22 * * *', () => enviar("Amor, no olvides las pastillitas 💊"), zonacol);

    // ===== RECORDATORIOS MENSUALES =====
    cron.schedule('0 9 26 * *', () => enviar("Amor, recuerda enviar la cuenta de cobro 📄"), zonacol);
    cron.schedule('0 9 4 * *', () => enviar("Amor, pagarle a Sols $29.000 💸"), zonacol);
    cron.schedule('0 9 30 * *', () => enviar("Amor, pagar tarjetas 💳"), zonacol);
});

// Manejo de desconexión para evitar errores de ejecución
client.on('disconnected', (reason) => {
    console.log('Cliente desconectado ❌:', reason);
    isReady = false;
    client.initialize(); // Intenta reconectar
});

async function enviar(texto) {
    // Si el cliente no está listo, evitamos el error de "Detached Frame"
    if (!isReady) {
        console.log('Intento de envío fallido: El cliente no está listo o la sesión se cerró.');
        return;
    }

    try {
        await client.sendMessage('573102900407@c.us', texto);
        console.log(`Mensaje enviado con éxito: ${texto}`);
    } catch (err) {
        console.error('Error crítico al enviar mensaje:', err.message);
        // Si detectamos que el frame se perdió, marcamos como no listo
        if (err.message.includes('detached Frame')) {
            isReady = false;
        }
    }
}

app.get('/ver-qr', (req, res) => {
    res.sendFile(path.join(__dirname, 'qr.png'));
});

app.get('/', (req, res) => {
    res.send(isReady ? 'Bot en línea 🚀' : 'Esperando conexión... Revisa /ver-qr');
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor activo en puerto ${port}`);
});

client.initialize();