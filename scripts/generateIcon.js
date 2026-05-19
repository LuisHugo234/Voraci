const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size, isAdaptive) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fondo
    if (!isAdaptive) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, size, size);
    } else {
        ctx.clearRect(0, 0, size, size);
    }

    // Configurar color del logo
    ctx.fillStyle = '#bef264';
    
    // Escala basada en 1024
    const center = size / 2;
    const scale = size / 1024;
    
    // Tazón
    ctx.beginPath();
    ctx.arc(center, center + (50 * scale), 200 * scale, 0, Math.PI, false);
    ctx.fill();

    // Base/plato
    ctx.fillRect(center - (220 * scale), center + (65 * scale), 440 * scale, 30 * scale);

    // Tapa/asa superior
    ctx.beginPath();
    ctx.arc(center, center - (20 * scale), 40 * scale, 0, Math.PI * 2, true);
    ctx.fill();

    return canvas.toBuffer('image/png');
}

// Asegurar que la carpeta assets existe
const assetsDir = path.join(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Generar ícono estándar
const iconBuffer = drawIcon(1024, false);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconBuffer);

// Generar ícono adaptativo
const adaptiveBuffer = drawIcon(1024, true);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveBuffer);

console.log('¡Íconos generados exitosamente en la carpeta assets!');
