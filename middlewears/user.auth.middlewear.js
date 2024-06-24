const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  // Obtener el token de la cabecera de la solicitud
  const token = req.header('Authorization');

  // Verificar si el token está presente
  if (!token) {
    return res.status(401).json({ message: 'Token de autenticación no proporcionado' });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Establecer req.user con la información del usuario
    req.user = decoded.user;
    
    // Continuar con la ejecución de la siguiente función de middleware
    next();
  } catch (error) {
    // Si el token no es válido, devolver un error de autenticación
    return res.status(401).json({ message: 'Token de autenticación inválido' });
  }
};

module.exports = authenticateUser;
