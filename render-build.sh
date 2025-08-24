#!/usr/bin/env bash
# exit on error
set -o errexit

# Instala las dependencias del sistema operativo para el monitor virtual
apt-get update && apt-get install -y xvfb chromium-browser

# Instala las dependencias de Python
pip install -r requirements.txt
