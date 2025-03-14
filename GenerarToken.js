const jwt = require('jsonwebtoken');

// Clave secreta para firmar el token (manténla en un archivo .env)
const SECRET_KEY = 'Kuky@20507795642';

// Función para generar un token (válido por 1 hora)
function generarToken(usuarioId) {
    const payload = { id: usuarioId };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

// Ejemplo de uso
const token = generarToken(123); // 123 es el ID del usuario
console.log('Token generado:', token);
