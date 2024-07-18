const Express = require('express')

const UserRoutes = Express.Router()

//middlewears



//funciones Controladoras

const {getAllUsers,userLogin,userRegister,userUpdate,userDelete, userRecovery, userBanned} = require('../controllers/user.controller')
const adminMiddlewear = require('../middlewears/admin.middlewear')


//rutas
UserRoutes.get('/',getAllUsers)
UserRoutes.post('/login',userLogin)
UserRoutes.post('/register',userRegister)
UserRoutes.put('/update/:id',userUpdate)
UserRoutes.post('/recovery',userRecovery)

//para usar esta ruta es requerido ser administrador
UserRoutes.delete('/delete/:id',adminMiddlewear,userDelete)

//esta ruta permite cambiar el estado del usuario de activo a inactivo y viceversa...
UserRoutes.post('/suspender/:id',adminMiddlewear,userBanned)



module.exports = UserRoutes;