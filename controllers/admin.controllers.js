const connection = require('../db/db.connection');
const bcrypt = require('bcrypt')

const generateAdminToken = require('../helpers/generete.token')

const Register = async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la solicitud
        const { username, password, rol } = req.body;

        // Validar que se hayan proporcionado los campos obligatorios
        if (!username || !password || !rol) {
            return res.status(400).json({ message: "Se requieren username, password y rol" });
        }

        // Hashear la contraseña utilizando bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo administrador en la tabla admins
        connection.query(
            'INSERT INTO admins (username, password, rol) VALUES (?, ?, ?)',
            [username, hashedPassword, rol],
            (error, results) => {
                if (error) {
                    console.error("Error al insertar el administrador:", error);
                    return res.status(500).json({ message: "Error al crear el administrador" });
                }
                res.status(201).json({ message: "Nuevo administrador creado con éxito" });
            }
        );
    } catch (error) {
        console.error("Error al crear el administrador:", error);
        res.status(500).json({ message: "Error al crear el administrador" });
    }
};




const GetAdmins= (req, res) => {
    // Query para seleccionar todos los administradores de la tabla admins
    const query = 'SELECT * FROM admins';

    // Ejecutar la consulta
    connection.query(query, (error, results) => {
        if (error) {
            console.error("Error al obtener los administradores:", error);
            return res.status(500).json({ message: "Error al obtener los administradores" });
        }
        // Devolver los resultados como respuesta
    
  
       

        res.status(200).json(results);
    });
};



const updateAdmin = (req, res) => {
    const { id } = req.params;
    const { username, password, rol } = req.body;

    // Query para actualizar el nombre de usuario, contraseña y rol del administrador con el ID proporcionado
    const query = 'UPDATE admins SET username = ?, password = ?, rol = ? WHERE id = ?';
    
    // Ejecutar la consulta
    connection.query(query, [username, password, rol, id], (error, results) => {
        if (error) {
            console.error("Error al actualizar el administrador:", error);
            return res.status(500).json({ message: "Error al actualizar el administrador" });
        }
        // Verificar si se actualizó correctamente
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "El administrador no existe" });
        }
        // Devolver mensaje de éxito
        res.status(200).json({ message: "Administrador actualizado correctamente" });
    });
};



const Login = (req, res) => {
    const { username, password } = req.body;
    console.log(username,password)

    // Verificar las credenciales del usuario en la base de datos
    const query = 'SELECT * FROM admins WHERE username = ?';
    connection.query(query, [username], (error, results) => {
        if (error) {
            console.error("Error al buscar el usuario en la base de datos:", error);
            return res.status(500).json({ message: "Error al iniciar sesión" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const user = results[0];

        // Verificar la contraseña utilizando bcrypt
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("Error al comparar las contraseñas:", err);
                return res.status(500).json({ message: "Error al iniciar sesión" });
            }

            if (!isMatch) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            // Generar un token JWT
            const token =generateAdminToken(user);

            // Devolver el token como respuesta
            res.status(200).json({ username:user.username,rol:user.rol,token:token });
        });
    });
};



const DeleteAdmin = (req, res) => {
    const adminId = req.params.id;

    // Ejecutar una consulta SQL DELETE para eliminar el administrador
    const query = 'DELETE FROM admins WHERE id = ?';
    connection.query(query, [adminId], (error, results) => {
        if (error) {
            console.error("Error al eliminar el administrador de la base de datos:", error);
            return res.status(500).json({ message: "Error al eliminar el administrador" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "El administrador no se encontró en la base de datos" });
        }

        // Si la eliminación fue exitosa, devolver una respuesta de éxito
        res.status(200).json({ message: "Administrador eliminado correctamente" });
    });
};


module.exports = {Register,GetAdmins,updateAdmin,Login,DeleteAdmin}
