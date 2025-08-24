import os
import pywhatkit as kit
from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return "Servidor del Bot de WhatsApp en Python está funcionando."

@app.route('/send-message', methods=['POST'])
def send_message():
    data = request.get_json()
    number = data.get('number')
    message = data.get('message')

    if not number or not message:
        return jsonify({'success': False, 'message': 'Falta el número o el mensaje.'}), 400

    try:
        # pywhatkit necesita el número con el signo '+'
        # Nos aseguramos de que lo tenga
        if not number.startswith('+'):
            # Asumimos que es un número de Ecuador si no tiene código de país explícito
            # ¡¡¡IMPORTANTE: AJUSTA ESTO A TU PAÍS!!! ej: '+52' para México
            if len(number) == 10 and number.startswith('09'):
                 number = '+593' + number[1:]
            elif len(number) == 9 and not number.startswith('0'):
                 number = '+593' + number
            else: # Si no, solo añadimos el +
                 number = '+' + number

        print(f"Intentando enviar a {number}: {message}")
        
        # Enviar instantáneamente
        kit.sendwhatmsg_instantly(number, message, wait_time=15, tab_close=True)
        
        print("Mensaje enviado a la cola de pywhatkit.")
        return jsonify({'success': True, 'message': 'Mensaje enviado exitosamente.'})

    except Exception as e:
        print(f"Error al enviar mensaje: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
