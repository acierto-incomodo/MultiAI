#!/bin/bash

# Script para construir paquete para Arch Linux (pacman).

# Termina el script inmediatamente si algún comando falla.
set -e

echo "Limpiando archivos .pkg.tar.zst anteriores de la carpeta dist/..."
rm -f dist/*.pkg.tar.zst

echo "Ejecutando el build para el paquete Arch (pacman)..."
npm run build:linux:pacman

echo "¡Proceso de build completado con éxito!"