const jwt = require('jsonwebtoken');
const connection = require('../db/db.connection');

/* const carga_credito = (req, res) => {
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

 */
/* const carga_credito = (req, res) => {
    try {
        const { id } = req.params;
        const { creditos } = req.body;

        if (!creditos) {
            return res.status(400).json({ message: "El campo creditos es requerido" });
        }

        const userQuery = 'SELECT * FROM users WHERE id = ?';
        connection.query(userQuery, [id], (userError, userResults) => {
            if (userError) {
                console.error("Error al verificar el usuario:", userError);
                return res.status(500).json({ message: "Error al verificar el usuario" });
            }

            if (userResults.length === 0) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            const creditosQuery = 'INSERT INTO creditos (creditos, user_id) VALUES (?, ?)';
            connection.query(creditosQuery, [creditos, id], (creditosError, creditosResults) => {
                if (creditosError) {
                    console.error("Error al cargar el crédito:", creditosError);
                    return res.status(500).json({ message: "Error al cargar el crédito" });
                }

                const updateQuery = 'UPDATE users SET creditos = creditos + ? WHERE id = ?';
                connection.query(updateQuery, [creditos, id], (updateError, updateResults) => {
                    if (updateError) {
                        console.error("Error al actualizar los créditos del usuario:", updateError);
                        return res.status(500).json({ message: "Error al actualizar los créditos del usuario" });
                    }

                    // Obtener los datos actualizados del usuario
                    connection.query(userQuery, [id], (userError, updatedUserResults) => {
                        if (userError) {
                            console.error("Error al obtener los datos actualizados del usuario:", userError);
                            return res.status(500).json({ message: "Error al obtener los datos actualizados del usuario" });
                        }

                        res.status(201).json({ 
                            message: "Crédito cargado exitosamente", 
                            user: updatedUserResults[0]  // Devolver los datos actualizados del usuario
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error("Error al cargar el crédito:", error);
        res.status(500).json({ message: "Error al cargar el crédito" });
    }
};
 */




const carga_credito = (req, res) => {
    const userId = req.params.id;
    const { creditos } = req.body;         // cantidad a cargar
    const adminId = req.user?.id || null;  // suposición: tienes middleware JWT que pone req.user
  
    connection.beginTransaction(err => {
      if (err) return res.status(500).json({ message: "Error al iniciar transacción" });
  
      // 1) Actualizar créditos en la tabla principal
      connection.query(
        'UPDATE users SET creditos = creditos + ? WHERE id = ?',
        [creditos, userId],
        (err1, result1) => {
          if (err1) return connection.rollback(() => res.status(500).json({ message: "Error al actualizar créditos" }));
  
          // 2) Insertar en el log
          connection.query(
            `INSERT INTO creditos_log
               (user_id, amount, admin_id, description)
             VALUES (?, ?, ?, ?)`,
            [userId, creditos, adminId, req.body.description || null],
            (err2) => {
              if (err2) {
                return connection.rollback(() => {
                  console.error(err2);
                  return res.status(500).json({ message: "Error al registrar en log" });
                });
              }
  
              // 3) Commit final
              connection.commit(err3 => {
                if (err3) {
                  return connection.rollback(() => {
                    console.error(err3);
                    return res.status(500).json({ message: "Error en commit" });
                  });
                }
                res.status(200).json({ message: "Créditos recargados y registro guardado" });
              });
            }
          );
        }
      );
    });
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

const getCreditLogs = (req, res) => {
    const sql = `
      SELECT 
        cl.id,
        cl.user_id,
        u.name AS user_name,
        cl.amount,
        cl.description,
        cl.admin_id,
        a.username AS admin_username,
        cl.created_at
      FROM creditos_log cl
      LEFT JOIN users u ON cl.user_id = u.id
      LEFT JOIN admins a ON cl.admin_id = a.id
      ORDER BY cl.created_at DESC
    `;
  
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('Error al obtener logs de créditos:', err);
        return res.status(500).json({ message: 'Error al obtener registros de crédito' });
      }
      res.json(results);
    });
  };




module.exports = {
    carga_credito,
    descarga_credito,
    obtenerCreditosUsuario,
    getCreditLogs
};
