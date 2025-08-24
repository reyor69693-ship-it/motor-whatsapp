console.log('--- INICIANDO SCRIPT DE DIAGNÓSTICO ---');

const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('1. Librerías cargadas correctamente.');

const app = express();
app.use(express.json());

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
        '--single-process', // <- Este puede ser clave
        '--disable-gpu'
    ]
  }
});

console.log('2. Cliente de WhatsApp creado. A punto de inicializar...');

client.on('qr', qr => {
    console.log("3. ¡CÓDIGO QR GENERADO! Escanéalo ahora.");
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('4. ¡ÉXITO! Cliente inicializado y listo para trabajar.');
});

client.on('auth_failure', msg => {
    console.error('ERROR DE AUTENTICACIÓN:', msg);
});

client.on('disconnected', (reason) => {
    console.log('ERROR: Cliente fue desconectado:', reason);
});

client.initialize();
console.log('-> Comando client.initialize() ejecutado. Esperando eventos...');

app.get('/', (req, res) => {
    res.send('El bot de WhatsApp está en modo diagnóstico.');
});

app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) { return res.status(400).json({ success: false, message: 'Falta número o mensaje' }); }
    try {
        const chatId = number.replace('+', '') + "@c.us";
        await client.sendMessage(chatId, message);
        res.status(200).json({ success: true, message: 'Mensaje enviado' });
    } catch (error) { res.status(500).json({ success: false, message: 'Error al enviar' }); }
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('-> Servidor web escuchando en el puerto ' + listener.address().port);
});
