const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors'); // La librería que maneja los permisos

const app = express();

// --- CONFIGURACIÓN DE CORS MEJORADA ---
// Le decimos explícitamente que acepte peticiones de cualquier origen.
// El asterisco '*' significa "cualquiera".
app.use(cors({
  origin: '*'
}));
// ------------------------------------

app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', qr => {
    console.log("¡ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP!");
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡Cliente de WhatsApp está listo!');
});

client.initialize();

app.get('/', (req, res) => {
    res.send('El bot de WhatsApp está funcionando :)');
});

app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) {
        return res.status(400).json({ success: false, message: 'Falta número o mensaje' });
    }
    try {
        const chatId = number.replace('+', '') + "@c.us";
        await client.sendMessage(chatId, message);
        res.status(200).json({ success: true, message: 'Mensaje enviado' });
    } catch (error) {
        console.error(Error al enviar a ${number}:, error);
        res.status(500).json({ success: false, message: 'Error al enviar' });
    }
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Tu app está escuchando en el puerto ' + listener.address().port);
});
