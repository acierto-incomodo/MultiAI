if (Test-Path -Path "dist") {
    Write-Host "Limpiando directorio dist, pero conservando latest-linux.yml..."
    # Elimina todo dentro de 'dist' excepto 'latest-linux.yml'
    Get-ChildItem -Path "dist" -Exclude "latest-linux.yml" | Remove-Item -Recurse -Force
}

npm i

# Continuar con el resto del script
npm run build:win

# Reemplazar espacios por guiones en los nombres de archivo .exe y .blockmap generados
Get-ChildItem -Path . -Recurse -Include '*.exe', '*.blockmap', '*.msi' | ForEach-Object {
    $newName = $_.Name -replace ' ', '-'
    Rename-Item -Path $_.FullName -NewName $newName
}

# Duplicar el .exe generado y llamarlo StormStore-Setup.exe
$exeFile = Get-ChildItem -Path "dist" -Filter "*.exe" | Select-Object -First 1
if ($exeFile) {
    Copy-Item -Path $exeFile.FullName -Destination (Join-Path $exeFile.DirectoryName "MultiAI-Setup.exe") -Force
    Write-Host "Se ha creado una copia: MultiAI-Setup.exe"
}