const jwt = require('jsonwebtoken');

// Función para generar un token JWT
function generateAdminToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        rol:user.rol
        // Puedes incluir cualquier otra información adicional que desees en el payload
    };

    // Generar el token JWT con una clave secreta
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // 'JWT_SECRET' es una clave secreta que debes definir en tus variables de entorno

    return token;
}

module.exports = generateAdminToken;