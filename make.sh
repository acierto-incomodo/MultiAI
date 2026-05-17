#!/bin/bash

# Script para construir paquete AppImage.

# Termina el script inmediatamente si algún comando falla.
set -e

echo "Limpiando archivos Linux anteriores de la carpeta dist/..."
rm -f dist/*.AppImage
rm -f dist/*.deb
rm -f dist/*.pkg.tar.zst
rm -f dist/*.pkg.tar.xz
rm -f dist/*.flatpak
rm -f dist/*.snap
rm -rf dist/linux-unpacked
rm -f dist/latest-linux.yml

echo "Ejecutando la build..."
npm run build:linux:all

echo "¡Proceso de build completado con éxito!"