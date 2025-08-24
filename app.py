import os
from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from urllib.parse import quote
import time

app = Flask(__name__)

# --- Configuración de Selenium ---
options = webdriver.ChromeOptions()
options.add_argument("--headless") # Ejecutar sin abrir una ventana visual
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-gpu")
options.add_argument("--window-size=1920x1080")
# Guarda la sesión en una carpeta para no tener que escanear el QR siempre
user_data_dir = os.path.join(os.getcwd(), "whatsapp_session")
options.add_argument(f"--user-data-dir={user_data_dir}")

# Inicializa el driver. WebDriver Manager descargará el driver correcto automáticamente.
try:
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    print("Driver de Selenium inicializado correctamente.")
except Exception as e:
    print(f"Error CRÍTICO al inicializar el driver: {e}")
    driver = None

# --- Rutas de la API ---
@app.route('/')
def index():
    return "Servidor del Bot de WhatsApp con Python y Selenium está funcionando."

@app.route('/get-qr')
def get_qr():
    if not driver:
        return "Driver no inicializado.", 500
    try:
        print("Navegando a WhatsApp Web para obtener QR...")
        driver.get('https://web.whatsapp.com')
        # Esperar a que el código QR aparezca en la página
        qr_element = WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-ref]"))
        )
        # Extraer el código del QR y mostrarlo en el log
        qr_code = qr_element.get_attribute("data-ref")
        print("--- CÓDIGO QR OBTENIDO ---")
        print(qr_code)
        print("--- COPIA EL TEXTO ANTERIOR Y PÉGALO EN UN GENERADOR DE QR ONLINE (ej: qr-code-generator.com) ---")
        return "Código QR impreso en los logs del servidor. Por favor, escanéalo.", 200
    except Exception as e:
        print(f"Error al obtener QR: {e}")
        return "Error al obtener QR. Revisa los logs.", 500

@app.route('/send-message', methods=['POST'])
def send_message():
    if not driver:
        return jsonify({'success': False, 'message': 'Driver no inicializado.'}), 500
    
    data = request.get_json()
    number = data.get('number').replace('+', '').replace(' ', '')
    message = data.get('message')

    if not number or not message:
        return jsonify({'success': False, 'message': 'Falta el número o el mensaje.'}), 400

    try:
        print(f"Enviando mensaje a {number}...")
        # Codificar el mensaje para que sea seguro en una URL
        encoded_message = quote(message)
        # Crear el enlace directo a la conversación
        link = f"https://web.whatsapp.com/send?phone={number}&text={encoded_message}"
        driver.get(link)

        # Esperar a que el botón de enviar esté disponible y hacer clic
        send_button = WebDriverWait(driver, 30).until(
            EC.element_to_be_clickable((By.XPATH, '//span[@data-icon="send"]'))
        )
        send_button.click()
        
        print(f"Mensaje enviado exitosamente a {number}")
        time.sleep(2) # Pequeña pausa para asegurar el envío
        return jsonify({'success': True, 'message': 'Mensaje enviado exitosamente.'})

    except Exception as e:
        print(f"Error al enviar mensaje: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
