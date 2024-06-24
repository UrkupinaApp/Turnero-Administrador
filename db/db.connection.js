const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config()

const connection = mysql.createConnection({
    host: process.env.DB_HOST, // Cambia esto por tu host de MySQL
    user: process.env.DB_USER, // Corregido: Utiliza DB_USER en mayúsculas
    password: process.env.DB_PASSWORD, // Cambia esto por tu contraseña de MySQL
    database: process.env.DATABASE // Cambia esto por el nombre de tu base de datos
});

module.exports = connection;
