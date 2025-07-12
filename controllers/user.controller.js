const bcrypt =require('bcrypt')
const jwt = require('jsonwebtoken');

//coneccion a la bd 
const connection = require('../db/db.connection')



const getAllUsers = (req,res)=>{
    try {
        // Consultar todos los usuarios de la base de datos
        connection.query(
            'SELECT * FROM users',
            (error, results) => {
                if (error) {
                    console.error("Error al obtener los usuarios:", error);
                    return res.status(500).json({ message: "Error al obtener los usuarios" });
                }
                // Verificar si se encontraron usuarios
                if (results.length === 0) {
                    return res.status(404).json({ message: "No se encontraron usuarios" });
                }
                res.status(200).json(results);
            }
        );
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        res.status(500).json({ message: "Error al obtener los usuarios" });
    }
}


//el login requiere el username o el telefono para buscar el usuario en la bd
const userLogin = async (req, res) => {
  try {
      const { tipo_login, identificador, password } = req.body;

      if (!tipo_login || !identificador || !password) {
          return res.status(400).json({ message: "Faltan datos de login" });
      }

      // Definir query y params según tipo_login
      let query = '';
      let param = identificador;

      if (tipo_login === 'dni') {
          query = 'SELECT * FROM users WHERE dni = ?';
      } else if (tipo_login === 'email') {
          query = 'SELECT * FROM users WHERE email = ?';
      } else if (tipo_login === 'celular') {
          query = 'SELECT * FROM users WHERE celular = ?';
      } else {
          return res.status(400).json({ message: "Tipo de login inválido" });
      }

      connection.query(query, [param], async (err, results) => {
          if (err) {
              return res.status(500).json({ message: "Error al buscar el usuario" });
          }

          if (results.length === 0) {
              return res.status(404).json({ message: "Usuario no encontrado" });
          }

          const user = results[0];

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
              return res.status(401).json({ message: "Credenciales inválidas" });
          }

          if (user.status === "activo") {
              const token = jwt.sign(
                  { userId: user.id, username: user.name, DNI: user.dni, Tel: user.celular },
                  process.env.JWT_SECRET,
                  { expiresIn: '3h' }
              );
              res.status(200).json({ token, id: user.id, creditos: user.creditos });
          } else {
              res.status(401).json({ message: "Su usuario está inactivo" });
          }
      });
  } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

/* 
const userRegister = async (req, res) => {
    try {
        const { name, password, celular, dni } = req.body;
        if (!name || !password || !celular || !dni) {
            return res.status(400).json({ message: "Nombre, contraseña, celular y DNI son requeridos" });
        }

        // Verificar si el usuario ya existe en la base de datos
        connection.query('SELECT * FROM users WHERE name = ? OR celular = ? OR dni = ?', [name, celular, dni], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error al verificar el usuario" });
            }
            
            // Si el usuario ya existe (mismo nombre, mismo celular o mismo DNI), devolver un mensaje de error
            if (results.length > 0) {
                return res.status(400).json({ message: "El usuario ya está registrado" });
            }

            // Si el usuario no existe, hashear la contraseña y realizar la inserción en la base de datos
            const hashedPass = await bcrypt.hash(password, 10);
            connection.query('INSERT INTO users (name, password, celular, dni) VALUES (?, ?, ?, ?)', [name, hashedPass, celular, dni], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: "Error al insertar usuario" });
                }
                res.status(201).json({ message: "Nuevo usuario registrado" });
            });
        });
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ message: "Error al crear el usuario" });
    }
}; */

/* const userRegister = async (req, res) => {
    console.log("registrando")
    try {
        const { name, password, celular, dni, email, fila, pasillo, puesto } = req.body;
        
        // Verificar si todos los campos requeridos están presentes
        if (!name || !password || !celular || !dni ||!email || !fila || !pasillo || !puesto ) {
            console.log(name,password,celular,dni,email,fila,pasillo,puesto)
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        // Verificar si el usuario ya existe en la base de datos
        connection.query('SELECT * FROM users WHERE name = ? OR celular = ? OR dni = ?', [name, celular, dni], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error al verificar el usuario" });
            }
            
            // Si el usuario ya existe (mismo nombre, mismo celular o mismo DNI), devolver un mensaje de error
            if (results.length > 0) {
                return res.status(400).json({ message: "El usuario ya está registrado" });
            }

            // Si el usuario no existe, hashear la contraseña y realizar la inserción en la base de datos
            const hashedPass = await bcrypt.hash(password, 10);
            const redesSocialesJSON = JSON.stringify(redes_sociales); // Convertir el objeto de redes sociales a JSON string
            
            connection.query('INSERT INTO users (name, password, creditos, celular, dni, email, fila, pasillo, puesto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                [name, hashedPass, 20, celular, dni, fila, pasillo, puesto, redesSocialesJSON], 
                (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ message: "Error al insertar usuario" });
                    }
                    res.status(201).json({ message: "Nuevo usuario registrado" });
                });
        });
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ message: "Error al crear el usuario" });
    }
};
 */

/* const userRegister = async (req, res) => {
  try {
    const {
      name, apellido, password, celular, dni, email = '',
      fila, pasillo, puesto, tipo_propietario, uso, inquilinos, tamano_puesto
    } = req.body;

    if (!name || !apellido || !password || !celular || !dni || !fila || !pasillo || !puesto || !tipo_propietario || !uso || !tamano_puesto) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben estar completos" });
    }

    if (![2, 4, "2", "4"].includes(tamano_puesto)) {
      return res.status(400).json({ message: "El tamaño del puesto debe ser 2 o 4 metros" });
    }

    if (uso === 'ALQUILA' && (!Array.isArray(inquilinos) || inquilinos.length === 0)) {
      return res.status(400).json({ message: "Debe agregar al menos 1 inquilino si el uso es ALQUILA" });
    }
    if (Array.isArray(inquilinos) && inquilinos.length > 2) {
      return res.status(400).json({ message: "Solo se pueden agregar hasta 2 inquilinos" });
    }

    // Validar usuario existente
    connection.query(
      'SELECT * FROM users WHERE name = ? OR celular = ? OR dni = ?',
      [name, celular, dni],
      async (err, results) => {
        if (err) return res.status(500).json({ message: "Error al verificar el usuario" });
        if (results.length > 0) return res.status(400).json({ message: "El usuario ya está registrado" });

        const hashedPass = await bcrypt.hash(password, 10);

        // Insertar propietario
        const propietarioData = [
          name, apellido, hashedPass, 20, celular, dni, email, fila, pasillo,
          puesto, tipo_propietario, uso, tamano_puesto,
          null, // columna inquilinos ya no la usás
          null // user_id_propietario
        ];

        connection.query(
          `INSERT INTO users 
            (name, apellido, password, creditos, celular, dni, email, fila, pasillo, puesto, tipo_propietario, uso, tamano_puesto, inquilinos, user_id_propietario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          propietarioData,
          async (err2, result) => {
            if (err2) {
              console.error("Error al insertar propietario:", err2);
              return res.status(500).json({ message: "Error al insertar propietario" });
            }

            const propietarioId = result.insertId;

            // Insertar inquilinos como usuarios separados
            if (Array.isArray(inquilinos) && inquilinos.length > 0) {
              for (const inquilino of inquilinos) {
                if (!inquilino.name || !inquilino.apellido || !inquilino.dni || !inquilino.celular) continue;

                const hashedInquilinoPass = await bcrypt.hash(inquilino.dni.toString(), 10); // o la lógica que quieras
                const inquilinoData = [
                  inquilino.name,
                  inquilino.apellido,
                  hashedInquilinoPass,
                  13,
                  inquilino.celular,
                  inquilino.dni,
                  inquilino.email || '',
                  fila,
                  pasillo,
                  puesto,
                  "INQUILINO",
                  "USO PROPIO",
                  tamano_puesto,
                  null,        // columna inquilinos
                  propietarioId // user_id_propietario
                ];

                connection.query(
                  `INSERT INTO users 
                    (name, apellido, password, creditos, celular, dni, email, fila, pasillo, puesto, tipo_propietario, uso, tamano_puesto, inquilinos, user_id_propietario)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  inquilinoData,
                  (err4) => {
                    if (err4) console.error("Error al insertar inquilino:", err4);
                  }
                );
              }
            }

            res.status(201).json({ message: "Propietario e inquilinos registrados" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};
 */


const userRegister = async (req, res) => {
  try {
    const {
      name, apellido, password, celular, dni, email = '',
      tipo_propietario, uso, creditos = 20, puestos = [],
      propietario_asignado // para socios/usuarios inquilinos
    } = req.body;

    // Validaciones mínimas
    if (!name || !apellido || !password || !celular || !dni || !tipo_propietario) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Si es propietario, deben venir datos de puestos (uno o varios)
    if (tipo_propietario === "PROPIETARIO") {
      if (!Array.isArray(puestos) || puestos.length === 0) {
        return res.status(400).json({ message: "Debe ingresar al menos un puesto" });
      }
      for (const puesto of puestos) {
        const { fila, pasillo, puesto: numPuesto, tamano_puesto, inquilinos } = puesto;
        if (!fila || !pasillo || !numPuesto || !tamano_puesto) {
          return res.status(400).json({ message: "Datos de puesto incompletos" });
        }
        if (![2, 4, "2", "4"].includes(tamano_puesto)) {
          return res.status(400).json({ message: "El tamaño del puesto debe ser 2 o 4 metros" });
        }
        if (Array.isArray(inquilinos) && inquilinos.length > (tamano_puesto == 4 ? 2 : 1)) {
          return res.status(400).json({ message: "Cantidad de inquilinos incorrecta para el tamaño del puesto" });
        }
      }
    }

    // Validar usuario existente por datos generales
    connection.query(
      'SELECT * FROM users WHERE (name = ? OR celular = ? OR dni = ?)',
      [name, celular, dni],
      async (err, results) => {
        if (err) return res.status(500).json({ message: "Error al verificar el usuario" });
        if (results.length > 0) return res.status(400).json({ message: "El usuario ya está registrado" });

        const hashedPass = await bcrypt.hash(password, 10);

        // Si es propietario, crear tantos usuarios como puestos
        if (tipo_propietario === "PROPIETARIO") {
          let successCount = 0, failCount = 0, errorMessages = [];
          for (const puesto of puestos) {
            const { fila, pasillo, puesto: numPuesto, tamano_puesto, inquilinos } = puesto;
            // Insertar propietario con datos de este puesto
            const propietarioData = [
              name, apellido, hashedPass, creditos, celular, dni, email, fila, pasillo,
              numPuesto, "PROPIETARIO", uso, tamano_puesto,
              null, // columna inquilinos
              null // user_id_propietario
            ];

            await new Promise((resolve, reject) => {
              connection.query(
                `INSERT INTO users 
                  (name, apellido, password, creditos, celular, dni, email, fila, pasillo, puesto, tipo_propietario, uso, tamano_puesto, inquilinos, user_id_propietario)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                propietarioData,
                async (err2, result) => {
                  if (err2) {
                    errorMessages.push(`Error al insertar puesto (${fila}-${pasillo}-${numPuesto}): ${err2.message}`);
                    failCount++; resolve();
                  } else {
                    successCount++;
                    const propietarioId = result.insertId;

                    // Insertar inquilinos (si hay)
                    if (Array.isArray(inquilinos) && inquilinos.length > 0) {
                      for (let i = 0; i < inquilinos.length; i++) {
                        const inquilino = inquilinos[i];
                        if (!inquilino.name || !inquilino.apellido || !inquilino.dni || !inquilino.celular) continue;

                        const hashedInquilinoPass = await bcrypt.hash(
                          inquilino.password || inquilino.dni.toString(), 10
                        );
                        const subletra = inquilino.subletra ? inquilino.subletra : null;
                        const inquilinoData = [
                          inquilino.name,
                          inquilino.apellido,
                          hashedInquilinoPass,
                          13,
                          inquilino.celular,
                          inquilino.dni,
                          inquilino.email || '',
                          fila,
                          pasillo,
                          numPuesto,
                          "INQUILINO",
                          "USO PROPIO",
                          tamano_puesto,
                          subletra,         // Usás columna "inquilinos" para poner la letra? Si no, quitá esto
                          propietarioId     // user_id_propietario
                        ];
                        connection.query(
                          `INSERT INTO users 
                            (name, apellido, password, creditos, celular, dni, email, fila, pasillo, puesto, tipo_propietario, uso, tamano_puesto, inquilinos, user_id_propietario)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                          inquilinoData,
                          (err4) => {
                            if (err4) errorMessages.push(`Error al insertar inquilino: ${err4.message}`);
                          }
                        );
                      }
                    }
                    resolve();
                  }
                }
              );
            });
          }
          if (successCount === 0) {
            return res.status(500).json({ message: errorMessages.join(' | ') });
          }
          return res.status(201).json({ message: `Registrados ${successCount} puestos del propietario. ${failCount > 0 ? failCount + ' errores.' : ''}` });
        } else if (tipo_propietario === "SOCIO" && propietario_asignado) {
          // Registrar un inquilino asignado a un propietario
          // ...acá armás la lógica de registrar usuario inquilino y vincular con propietario
          // (Depende de cómo los quieras crear: solo como "SOCIO" o como "INQUILINO" y a qué puesto lo asociás)
          // Completá según reglas de tu negocio
          return res.status(201).json({ message: "Usuario socio registrado" });
        } else {
          return res.status(400).json({ message: "Tipo de registro no implementado aún" });
        }
      }
    );
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};
// controllers/users.js
const buscarPropietarios = (req, res) => {
  const { search } = req.query;

  // Validación básica
  if (!search || search.length < 3)
    return res.json([]); // Array vacío si el término es corto

  // Usar LIKE para buscar nombre, apellido o dni similar
  const query = `
    SELECT id, name, apellido, dni 
    FROM users 
    WHERE tipo_propietario = 'PROPIETARIO'
      AND (
        name LIKE ? OR
        apellido LIKE ? OR
        dni LIKE ?
      )
    LIMIT 15
  `;
  const s = `%${search}%`;
  connection.query(query, [s, s, s], (err, results) => {
    if (err) {
      console.error('Error al buscar propietarios:', err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
};










const userUpdate = async (req,res)=>{
    try {
        const { id } = req.params; // ID del usuario a actualizar
        const { name, password, celular, dni,creditos } = req.body; // Nuevos datos del usuario

        // Verificar que al menos uno de los campos a actualizar esté presente en el cuerpo de la solicitud
        if (!name && !password && !celular && !dni && !creditos) {
            return res.status(400).json({ message: "Se requiere al menos un campo para actualizar" });
        }

        // Construir la consulta SQL dinámica para actualizar los campos proporcionados
        let updateFields = [];
        let updateValues = [];
        if (name) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }
        if (celular) {
            updateFields.push('celular = ?');
            updateValues.push(celular);
        }
        if (dni) {
            updateFields.push('dni = ?');
            updateValues.push(dni);
        }
        if (creditos) {
            updateFields.push('creditos = ?');
            updateValues.push(creditos);
        }

        // Ejecutar la consulta SQL para actualizar el usuario
        updateValues.push(id); // Agregar el ID del usuario al final del array de valores
        connection.query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues, (err, results) => {
            if (err) {
                console.error("Error al actualizar el usuario:", err);
                return res.status(500).json({ message: "Error al actualizar el usuario" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json({ message: "Usuario actualizado correctamente" });
        });
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        res.status(500).json({ message: "Error al actualizar el usuario" });
    }


}

const userRecovery = (req,res)=>{
    try {
        const { name, telefono } = req.body; // Obtener el nombre de usuario y el teléfono desde el cuerpo de la solicitud

        // Verificar que al menos uno de los campos sea proporcionado
        if (!name && !telefono) {
            return res.status(400).json({ message: "Se requiere nombre de usuario o teléfono" });
        }

        let field;
        let value;
        if (name) {
            field = 'name';
            value = name;
        } else {
            field = 'telefono';
            value = telefono;
        }

        // Consultar la base de datos para obtener la contraseña
        connection.query(`SELECT password FROM users WHERE ${field} = ?`, [value], (err, results) => {
            if (err) {
                console.error("Error al recuperar la contraseña:", err);
                return res.status(500).json({ message: "Error al recuperar la contraseña" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            const password = results[0].password;
        
            res.status(200).json({ password });
        });
    } catch (error) {
        console.error("Error al recuperar la contraseña:", error);
        res.status(500).json({ message: "Error al recuperar la contraseña" });
    }
}

const userDelete = (req, res) => {
  const userId = req.params.id;

  connection.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al iniciar transacción" });
    }

    // 1) Borrar créditos
    connection.query(
      'DELETE FROM creditos WHERE user_id = ?',
      [userId],
      (err1) => {
        if (err1) {
          return connection.rollback(() => {
            console.error(err1);
            res.status(500).json({ message: "Error al borrar créditos" });
          });
        }

        // 2) Borrar turnos
        connection.query(
          'DELETE FROM turnos WHERE id_user = ?',
          [userId],
          (err2) => {
            if (err2) {
              return connection.rollback(() => {
                console.error(err2);
                res.status(500).json({ message: "Error al borrar turnos" });
              });
            }

            // 3) Borrar usuario
            connection.query(
              'DELETE FROM users WHERE id = ?',
              [userId],
              (err3, result3) => {
                if (err3) {
                  return connection.rollback(() => {
                    console.error(err3);
                    res.status(500).json({ message: "Error al borrar usuario" });
                  });
                }
                if (result3.affectedRows === 0) {
                  return connection.rollback(() => {
                    res.status(404).json({ message: "Usuario no encontrado" });
                  });
                }
                // Commit
                connection.commit(err4 => {
                  if (err4) {
                    return connection.rollback(() => {
                      console.error(err4);
                      res.status(500).json({ message: "Error en commit" });
                    });
                  }
                  res.status(200).json({ message: "Usuario y dependencias eliminados" });
                });
              }
            );
          }
        );
      }
    );
  });
};

const userBanned = (req, res) => {
    try {
      const userId = req.params.id;
      const { status } = req.body;
  
      if (!status) {
        return res.status(400).json({ message: "Se requiere el nuevo estado del usuario" });
      }
  
      if (status !== 'activo' && status !== 'inactivo') {
        return res.status(400).json({ message: "El nuevo estado del usuario debe ser 'activo' o 'inactivo'" });
      }
  
      connection.query(
        'UPDATE users SET status = ?, creditos = ? WHERE id = ?',
        [status, 0, userId],
        (error, results) => {
          if (error) {
            console.error("Error al actualizar el estado del usuario:", error);
            return res.status(500).json({ message: "Error al actualizar el estado del usuario" });
          }
  
          if (results.affectedRows === 0) {
            return res.status(404).json({ message: "El usuario no existe" });
          }
  
          res.status(200).json({ message: "Estado del usuario y créditos actualizados con éxito" });
        }
      );
    } catch (error) {
      console.error("Error general al actualizar el usuario:", error);
      res.status(500).json({ message: "Error al actualizar el estado del usuario" });
    }
  };
  




module.exports = {getAllUsers,
    userLogin,
    userRegister,
    userUpdate,
    userDelete,
    userRecovery,
    userBanned,
  buscarPropietarios}


