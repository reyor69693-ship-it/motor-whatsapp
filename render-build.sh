#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Iniciando script de construcción personalizado ---"

# Paso 1: Instalar las dependencias de Python
echo "Instalando paquetes de Python desde requirements.txt..."
pip install -r requirements.txt
echo "Paquetes de Python instalados."

# Paso 2: Instalar Google Chrome y sus dependencias
echo "Instalando Google Chrome estable..."
apt-get update
apt-get install -y wget gnupg
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list
apt-get update
apt-get install -y google-chrome-stable
echo "Google Chrome instalado."

echo "--- Script de construcción finalizado ---"
