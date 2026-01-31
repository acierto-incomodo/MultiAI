#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function calculateSHA512(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha512');
  hashSum.update(fileBuffer);
  return hashSum.digest('base64');
}

function getFileSize(filePath) {
  return fs.statSync(filePath).size;
}

// Leer la versión del package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

const distDir = path.join(__dirname, 'dist');

// Buscar archivos .deb y .AppImage
const debFile = fs.readdirSync(distDir).find(f => f.endsWith('.deb'));
const appImageFile = fs.readdirSync(distDir).find(f => f.endsWith('.AppImage'));

if (!debFile || !appImageFile) {
  console.error('Error: No se encontraron ambos archivos (.deb y .AppImage) en la carpeta dist/');
  if (!debFile) console.error('  - Falta el archivo .deb');
  if (!appImageFile) console.error('  - Falta el archivo .AppImage');
  process.exit(1);
}

const debPath = path.join(distDir, debFile);
const appImagePath = path.join(distDir, appImageFile);

const debSha512 = calculateSHA512(debPath);
const appImageSha512 = calculateSHA512(appImagePath);

const debSize = getFileSize(debPath);
const appImageSize = getFileSize(appImagePath);

// Generar el archivo YAML con ambos formatos
const latestLinuxContent = `version: ${version}
files:
  - url: ${debFile}
    sha512: ${debSha512}
    size: ${debSize}
  - url: ${appImageFile}
    sha512: ${appImageSha512}
    size: ${appImageSize}
path: ${debFile}
sha512: ${debSha512}
releaseDate: '${new Date().toISOString()}'
`;

const latestLinuxPath = path.join(distDir, 'latest-linux.yml');
fs.writeFileSync(latestLinuxPath, latestLinuxContent);

console.log('✓ Archivo latest-linux.yml generado exitosamente');
console.log(`  - Versión: ${version}`);
console.log(`  - DEB: ${debFile} (${debSize} bytes)`);
console.log(`  - AppImage: ${appImageFile} (${appImageSize} bytes)`);
