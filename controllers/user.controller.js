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
        //tener en cuenta en el front..
        const { usernameOrPhone, password } = req.body;
        console.log(usernameOrPhone,password)
        if (!usernameOrPhone || !password) {
            return res.status(400).json({ message: "Nombre de usuario o teléfono y contraseña son requeridos" });
        }

        // Verificar si el usuario existe en la base de datos utilizando el nombre de usuario o el número de teléfono
        connection.query('SELECT * FROM users WHERE name = ? OR celular = ?', [usernameOrPhone, usernameOrPhone], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error al buscar el usuario" });
            }

            // Si no se encontró ningún usuario con los datos proporcionados, devolver un mensaje de error
            if (results.length === 0) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            // Verificar la contraseña
            const user = results[0];
            console.log(user)
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            // Generar un token JWT con una expiración de 1 hora
            if(user.status === "activo"){
            const token = jwt.sign({ userId: user.id,username:user.name,DNI:user.dni,Tel:user.celular,Pasillo:user.pasillo,Fila:user.fila,Puesto:user.puesto,Redes:user.redes_sociales }, process.env.JWT_SECRET, { expiresIn: '3h' });
            res.status(200).json({ token,"id":user.id,"creditos":user.creditos });
        }else{
            res.status(401).json({message:"su usuario esta inactivo"})
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

const userRegister = async (req, res) => {
    try {
        const { name, password, celular, dni, fila, pasillo, puesto, redes_sociales } = req.body;
        
        // Verificar si todos los campos requeridos están presentes
        if (!name || !password || !celular || !dni || !fila || !pasillo || !puesto || !redes_sociales) {
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
            
            connection.query('INSERT INTO users (name, password, celular, dni, fila, pasillo, puesto, redes_sociales) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                [name, hashedPass, celular, dni, fila, pasillo, puesto, redesSocialesJSON], 
                (err, results) => {
                    if (err) {
                        console.log(err)
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

const userDelete = (req,res)=>{
    try {
        // Obtener el ID del usuario a eliminar desde los parámetros de la solicitud
        const userId = req.params.id;

        // Eliminar el usuario de la base de datos
        connection.query(
            'DELETE FROM users WHERE id = ?',
            [userId],
            (error, results) => {
                if (error) {
                    console.error("Error al eliminar el usuario:", error);
                    return res.status(500).json({ message: "Error al eliminar el usuario" });
                }
                // Verificar si se eliminó algún registro
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "El usuario no existe" });
                }
                res.status(200).json({ message: "Usuario eliminado con éxito" });
            }
        );
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        res.status(500).json({ message: "Error al eliminar el usuario" });
    }
}

const userBanned = (req,res)=>{
    try {
        // Obtener el ID del usuario y el nuevo estado desde los parámetros de la solicitud
        const userId = req.params.id;
        const { status } = req.body;

        // Verificar que se haya proporcionado un nuevo estado
        if (!status) {
            return res.status(400).json({ message: "Se requiere el nuevo estado del usuario" });
        }

        // Verificar que el nuevo estado sea válido ('active' o 'inactive')
        if (status !== 'activo' && status !== 'inactivo') {
            return res.status(400).json({ message: "El nuevo estado del usuario debe ser 'active' o 'inactive'" });
        }

        // Actualizar el estado del usuario en la base de datos
        connection.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, userId],
            (error, results) => {
                if (error) {
                    console.error("Error al actualizar el estado del usuario:", error);
                    return res.status(500).json({ message: "Error al actualizar el estado del usuario" });
                }
                // Verificar si se actualizó algún registro
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "El usuario no existe" });
                }
                res.status(200).json({ message: "Estado del usuario actualizado con éxito" });
            }
        );
    } catch (error) {
        console.error("Error al actualizar el estado del usuario:", error);
        res.status(500).json({ message: "Error al actualizar el estado del usuario" });
    }
}


module.exports = {getAllUsers,
    userLogin,
    userRegister,
    userUpdate,
    userDelete,
    userRecovery,
    userBanned}


