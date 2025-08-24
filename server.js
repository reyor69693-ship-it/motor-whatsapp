const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' })); // Permite conexiones de cualquier origen
app.use(express.json());

// Configuración del cliente con optimizaciones para entornos como Render
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote'
    ]
  }
});

client.on('qr', qr => {
    console.log("¡CÓDIGO QR LISTO! Por favor, escanéalo con tu WhatsApp.");
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡ÉXITO! El cliente de WhatsApp está conectado y listo para enviar mensajes.');
});

client.on('disconnected', (reason) => {
    console.log('¡ATENCIÓN! El cliente fue desconectado:', reason);
    // Podríamos intentar reinicializar, pero por ahora solo lo notificamos.
});

// Inicializamos el cliente
console.log("Inicializando cliente de WhatsApp...");
client.initialize();

// Ruta para verificar que el servidor está vivo
app.get('/', (req, res) => {
    res.send('El servidor del bot de WhatsApp está funcionando correctamente.');
});

// Ruta para recibir órdenes de envío de mensajes
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;
    console.log(Recibida petición para enviar a: ${number});

    if (!number || !message) {
        return res.status(400).json({ success: false, message: 'Falta el número o el mensaje.' });
    }
    try {
        // Formateamos el número para que sea compatible con la API
        const chatId = number.replace(/\D/g, '') + "@c.us";
        await client.sendMessage(chatId, message);
        console.log(Mensaje enviado exitosamente a ${number});
        res.status(200).json({ success: true, message: 'Mensaje enviado correctamente.' });
    } catch (error) {
        console.error(FALLO CRÍTICO al enviar a ${number}:, error);
        res.status(500).json({ success: false, message: 'Error interno al intentar enviar el mensaje.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(Servidor web escuchando en el puerto ${PORT});
});
