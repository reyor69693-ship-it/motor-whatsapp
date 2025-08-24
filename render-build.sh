#!/usr/bin/env bash
set -o errexit

echo "--- Iniciando script de construcción v2 ---"

# Paso 1: Instalar dependencias del sistema y Google Chrome
apt-get update
apt-get install -y wget gnupg unzip
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
apt-get update
apt-get install -y google-chrome-stable chromedriver

echo "Google Chrome y Chromedriver instalados."

# Paso 2: Instalar dependencias de Python
pip install -r requirements.txt
echo "Paquetes de Python instalados."

echo "--- Script de construcción finalizado ---"
