const jwt = require('jsonwebtoken');
const connection = require('../db/db.connection');

const carga_credito = (req, res) => {
    try {
        // Obtener el userId de los parámetros de la solicitud
        const { id } = req.params;

        // Obtener los datos del cuerpo de la solicitud
        const { creditos } = req.body;

        // Validar que se haya proporcionado el campo creditos
        if (!creditos) {
            return res.status(400).json({ message: "El campo creditos es requerido" });
        }

        // Verificar que el ID proporcionado pertenezca a un usuario registrado
        const userQuery = 'SELECT * FROM users WHERE id = ?';
        connection.query(userQuery, [id], (userError, userResults) => {
            if (userError) {
                console.error("Error al verificar el usuario:", userError);
                return res.status(500).json({ message: "Error al verificar el usuario" });
            }

            if (userResults.length === 0) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            // Insertar el nuevo crédito en la tabla creditos
            const creditosQuery = 'INSERT INTO creditos (creditos, user_id) VALUES (?, ?)';
            connection.query(creditosQuery, [creditos, id], (creditosError, creditosResults) => {
                if (creditosError) {
                    console.error("Error al cargar el crédito:", creditosError);
                    return res.status(500).json({ message: "Error al cargar el crédito" });
                }

                // Actualizar la columna creditos en la tabla users
                const updateQuery = 'UPDATE users SET creditos = creditos + ? WHERE id = ?';
                connection.query(updateQuery, [creditos, id], (updateError, updateResults) => {
                    if (updateError) {
                        console.error("Error al actualizar los créditos del usuario:", updateError);
                        return res.status(500).json({ message: "Error al actualizar los créditos del usuario" });
                    }
                    res.status(201).json({ message: "Crédito cargado exitosamente" });
                });
            });
        });
    } catch (error) {
        console.error("Error al cargar el crédito:", error);
        res.status(500).json({ message: "Error al cargar el crédito" });
    }
};




const descarga_credito = (req, res) => {
    try {
        // Obtener el userId de los parámetros de la solicitud
        const { id } = req.params;

        // Obtener los datos del cuerpo de la solicitud
        const { creditos } = req.body;

        // Validar que se haya proporcionado el campo creditos
        if (!creditos) {
            return res.status(400).json({ message: "El campo creditos es requerido" });
        }

        // Verificar que el ID proporcionado pertenezca a un usuario registrado
        const userQuery = 'SELECT * FROM users WHERE id = ?';
        connection.query(userQuery, [id], (userError, userResults) => {
            if (userError) {
                console.error("Error al verificar el usuario:", userError);
                return res.status(500).json({ message: "Error al verificar el usuario" });
            }

            if (userResults.length === 0) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            // Verificar que el usuario tenga suficientes créditos para descargar
            const userCredits = userResults[0].creditos;
            if (userCredits < creditos) {
                return res.status(400).json({ message: "El usuario no tiene suficientes créditos para descargar" });
            }

            // Descontar los créditos de la cuenta del usuario
            const newCredits = userCredits - creditos;
            const updateQuery = 'UPDATE users SET creditos = ? WHERE id = ?';
            connection.query(updateQuery, [newCredits, id], (updateError, updateResults) => {
                if (updateError) {
                    console.error("Error al actualizar los créditos del usuario:", updateError);
                    return res.status(500).json({ message: "Error al actualizar los créditos del usuario" });
                }
                res.status(201).json({ message: "Créditos descargados exitosamente" });
            });
        });
    } catch (error) {
        console.error("Error al descargar el crédito:", error);
        res.status(500).json({ message: "Error al descargar el crédito" });
    }
};

const obtenerCreditosUsuario = (req, res) => {
    try {
        // Obtener el userId de los parámetros de la solicitud
        const { id } = req.params;

        // Consultar la cantidad de créditos del usuario
        const query = 'SELECT creditos FROM users WHERE id = ?';
        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error("Error al obtener los créditos del usuario:", error);
                return res.status(500).json({ message: "Error al obtener los créditos del usuario" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            res.status(200).json({ creditos: results[0].creditos });
        });
    } catch (error) {
        console.error("Error al obtener los créditos del usuario:", error);
        res.status(500).json({ message: "Error al obtener los créditos del usuario" });
    }
};




module.exports = {
    carga_credito,
    descarga_credito,
    obtenerCreditosUsuario
};
