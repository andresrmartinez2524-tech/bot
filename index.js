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
let isReady = false;
let cronIniciado = false; // 🔥 ESTA ES LA CLAVE

client.on('qr', async (qr) => {
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

    // 🔥 EVITA DUPLICADOS
    if (cronIniciado) return;
    cronIniciado = true;
    
    // ===== MENSAJES DIARIOS =====
    cron.schedule('0 8 * * *', () => enviar("Amor tómate los probióticos po favooo daleeeeee!!!!"), zonacol);
    cron.schedule('0 9 * * *', () => enviar("Amor, ve al gym, ese qlito no crece solo jeje 🤤"), zonacol);
    cron.schedule('0 10 * * *', () => enviar("Amor, hora de desayunar plis, mas atenta"), zonacol);
    cron.schedule('0 13 * * *', () => enviar("Amor y el almuerzoooo?? come, no?"), zonacol);
    cron.schedule('0 21 * * *', () => enviar("Amor, son las 9 y nada que comes???? ok."), zonacol);
    cron.schedule('0 22 * * *', () => enviar("Amor tomate la pastilla o después me haces papá jeje"), zonacol);

    cron.schedule('40 19 * * *', () => enviar("Hola soy un bot"), zonacol);


    // ===== RECORDATORIOS MENSUALES =====
    cron.schedule('0 9 26 * *', () => enviar("Amor, recuerda enviar la cuenta de cobro 📄"), zonacol);
    cron.schedule('0 9 4 * *', () => enviar("Amor, pagarle a Sols $29.000 💸"), zonacol);
    cron.schedule('0 9 30 * *', () => enviar("Amor, pagar tarjetas 💳"), zonacol);
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado ❌:', reason);
    isReady = false;
    client.initialize();
});

async function enviar(texto) {
    if (!isReady) {
        console.log('Intento de envío fallido: El cliente no está listo o la sesión se cerró.');
        return;
    }

    try {
        await client.sendMessage('573102900407@c.us', texto);
        console.log(`Mensaje enviado con éxito: ${texto}`);
    } catch (err) {
        console.error('Error crítico al enviar mensaje:', err.message);
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