echo "Preparando build general..."

sleep 1

echo "Iniciando build DEB..."
./makeDeb.sh
echo "¡Proceso de build completado con éxito!"
echo "DEB Finalizado"

sleep 1

echo "Iniciando build SNAP..."
./makeSnap.sh
echo "¡Proceso de build y subida completado con éxito!"
echo "SNAP Finalizado"

sleep 1

echo "Build general completado con éxito."