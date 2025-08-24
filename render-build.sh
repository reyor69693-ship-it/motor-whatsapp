#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Iniciando script de construcción v3 (Robusto) ---"

# Actualizar la lista de paquetes del sistema
apt-get update -y

# Instalar dependencias necesarias para añadir repositorios y descargar archivos
apt-get install -y --no-install-recommends wget gnupg ca-certificates

# Añadir la clave de Google Chrome
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -

# Añadir el repositorio de Google Chrome
sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list'

# Actualizar la lista de paquetes de nuevo con el repo de Google
apt-get update -y

# Instalar Google Chrome y Chromedriver. El flag -y responde "sí" a todo.
apt-get install -y google-chrome-stable chromedriver

echo "Google Chrome y Chromedriver instalados."

# Limpiar la caché de apt para reducir el tamaño de la imagen
rm -rf /var/lib/apt/lists/*

# Instalar las dependencias de Python
pip install --upgrade pip
pip install -r requirements.txt
echo "Paquetes de Python instalados."

echo "--- Script de construcción finalizado exitosamente ---"
