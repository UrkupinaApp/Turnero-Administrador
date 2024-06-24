const { use } = require('bcrypt/promises');
const connection = require('../db/db.connection')
const { v4: uuidv4 } = require('uuid');

const {io} =require('../index')


const jwt = require('jsonwebtoken')




const generateShortCode = () => {
    const characters = '0123456789';
    let code = '';
    for (let i = 0; i < 2; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}



const crearTurno = (req, res) => {
    try {
        // Obtener el token de autenticación del encabezado Authorization
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Token de autenticación no proporcionado" });
        }
        const token = authHeader;

        // Verificar y decodificar el token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Token de autenticación inválido" });
            }

            // Obtener los datos del usuario decodificados
            const { userId, username } = decoded;

            // Obtener los datos del cuerpo de la solicitud
            const { fecha, motivo, hora } = req.body;
            console.log(motivo)

            // Validar que se hayan proporcionado la fecha, el motivo y la hora
            if (!fecha || !motivo || !hora) {
                return res.status(400).json({ message: "Se requieren fecha, motivo y hora" });
            }

            // Generar el código de reserva único y corto
            const shortCode = generateShortCode();

            // Determinar el prefijo del código de reserva basado en el motivo
            let prefijoCodigo;
            if (motivo === "Pago de expensas") {
                prefijoCodigo = "PE";
            } else if (motivo === "Turno de administración") {
                prefijoCodigo = "AM";
            } else {
                prefijoCodigo = "OT"; // Prefijo para otros motivos no especificados
            }

            // Generar el código de reserva
            const codigoReserva = `${prefijoCodigo}${shortCode}`;

            // Insertar el nuevo turno en la tabla turnos
            connection.query(
                'INSERT INTO turnos (id_user, user_name, motivo, status, caja, fecha, hora, cod_reserva) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, username, motivo, 'pendiente', null, fecha, hora, codigoReserva],
                (error, results) => {
                    if (error) {
                        console.error("Error al insertar el turno:", error);
                        return res.status(500).json({ message: "Error al crear el turno" });
                    }
                    res.status(201).json({ message: "Nuevo turno creado con éxito", codigoReserva });

                    

                }
            );
        });
    } catch (error) {
        console.error("Error al crear el turno:", error);
        res.status(500).json({ message: "Error al crear el turno" });
    }
};


const getTurnos = (req,res)=>{
    try {
        connection.query('SELECT * FROM turnos', (error, results) => {
            if (error) {
                console.error("Error al obtener los turnos:", error);
                return res.status(500).json({ message: "Error al obtener los turnos" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error("Error al obtener los turnos:", error);
        res.status(500).json({ message: "Error al obtener los turnos" });
    }


}

const getUserTurnos = (req,res)=>{

    try {
        const id_user = req.params.id;
        console.log(id_user)

        // Consulta para obtener los turnos del usuario especificado
        const query = 'SELECT * FROM turnos WHERE id_user = ?';

        connection.query(query, [id_user], (error, results) => {
            if (error) {
                console.error("Error al obtener los turnos:", error);
                return res.status(500).json({ message: "Error al obtener los turnos" });
            }

            // Comprobar si se encontraron turnos para el id_user especificado
            if (results.length === 0) {
                return res.status(404).json({ message: "No se encontraron turnos para el usuario especificado" });
            }

            // Devolver los turnos encontrados
            res.status(200).json(results);
        });
    } catch (error) {
        console.error("Error al obtener los turnos:", error);
        res.status(500).json({ message: "Error al obtener los turnos" });
    }
}

const updateTurno = (req,res)=>{

    try {
        // Obtener el token de autenticación del encabezado Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader;
        if (!token) {
            return res.status(401).json({ message: "Token de autenticación no proporcionado" });
        }

        // Verificar y decodificar el token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Token de autenticación inválido" });
            }

            // Obtener el id del usuario decodificado
            const userId = decoded.userId;

            // Obtener los datos del cuerpo de la solicitud
            const { fecha, motivo } = req.body;
            const turnoId = req.params.id;

            // Validar que se hayan proporcionado la fecha y el motivo
            if (!fecha || !motivo) {
                return res.status(400).json({ message: "Se requieren fecha y motivo" });
            }
            console.log(fecha,motivo,turnoId,userId)
            // Actualizar el turno en la tabla turnos
            connection.query(
                'UPDATE turnos SET fecha = ?, motivo = ? WHERE id = ? AND id_user = ?',
                [fecha, motivo, turnoId, userId],
                (error, results) => {
                    if (error) {
                        console.error("Error al actualizar el turno:", error);
                        return res.status(500).json({ message: "Error al actualizar el turno" });
                    }
                    if (results.affectedRows === 0) {
                        return res.status(404).json({ message: "Turno no encontrado para el usuario especificado" });
                    }
                    res.status(200).json({ message: "Turno actualizado con éxito" });
                }
            );
        });
    } catch (error) {
        console.error("Error al actualizar el turno:", error);
        res.status(500).json({ message: "Error al actualizar el turno" });
    }

}



const cancelTurno = (req, res) => {
    const { id } = req.params;
    console.log(id)
    const authHeader = req.headers['authorization'];
  
    if (!authHeader) {
      return res.status(401).json({ message: "Token de autenticación no proporcionado" });
    }
  
    const token = authHeader;
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      const userId = decoded.userId;
  
      connection.query(
        'SELECT id_user FROM turnos WHERE id = ?',
        [id],
        (error, results) => {
          if (error) {
            console.error("Error al verificar el turno:", error);
            return res.status(500).json({ message: "Error al verificar el turno" });
          }
  
          if (results.length === 0 || results[0].id_user !== userId) {
            return res.status(403).json({ message: "No tienes permiso para cancelar este turno" });
          }
  
          connection.query(
            'UPDATE turnos SET status = ? WHERE id = ?',
            ['cancelado', id],
            (error, results) => {
              if (error) {
                console.error("Error al cancelar el turno:", error);
                return res.status(500).json({ message: "Error al cancelar el turno" });
              }
              res.status(200).json({ message: "Turno cancelado con éxito" });
            }
          );
        }
      );
    } catch (error) {
      console.error("Error al verificar el token:", error);
      return res.status(403).json({ message: "Token de autenticación inválido" });
    }
  };


  const getTurnoDia = (req, res) => {
    const { dia } = req.params;
  
    const query = 'SELECT * FROM turnos WHERE fecha = ?';
    connection.query(query, [dia], (err, results) => {
      if (err) {
        console.error('Error fetching turnos:', err);
        return res.status(500).json({ message: 'Error fetching turnos', error: err });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'No turnos found for this day' });
      }
  
      res.status(200).json(results);
    });
  };
  



module.exports = {crearTurno,
    getTurnos,
    getUserTurnos,
    updateTurno,
    cancelTurno,
getTurnoDia}