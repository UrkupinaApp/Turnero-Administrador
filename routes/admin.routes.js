const Express = require('express')

const AdminRouter = Express.Router()

//middlewears
const {verifyRole} = require('../middlewears/superAdmin.middlewear')

const adminMiddlewear = require('../middlewears/admin.middlewear')

//funciones controladoras

const {Register, GetAdmins, updateAdmin, Login, DeleteAdmin} = require('../controllers/admin.controllers')



//rutas 

AdminRouter.get('/',adminMiddlewear,GetAdmins)

AdminRouter.post('/login',Login)

AdminRouter.put('/api/recovery/:id',adminMiddlewear,updateAdmin)

AdminRouter.delete('/delete/:id',verifyRole,DeleteAdmin)

AdminRouter.post('/register',Register)


module.exports = AdminRouter;