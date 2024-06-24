const Express = require('express')
const { crearTurno, getTurnos, getUserTurnos, updateTurno, cancelTurno,getTurnoDia } = require('../controllers/turnos.controllers')
const { updateAdmin } = require('../controllers/admin.controllers')
const adminMiddlewear = require('../middlewears/admin.middlewear')
const authenticateUser = require('../middlewears/user.auth.middlewear')
const turnosRouter = Express.Router()


//devuelven los turnos en la bd
turnosRouter.get('/',getTurnos)
turnosRouter.get('/dia/:dia',getTurnoDia)
turnosRouter.get('/misturnos/:id',getUserTurnos)

//crea un turno 
turnosRouter.post('/post',authenticateUser,crearTurno)


//modifica un turno
turnosRouter.put('/update/:id',authenticateUser,updateTurno)
turnosRouter.put('/cancel/:id',authenticateUser,cancelTurno)

//elimina un turno  
turnosRouter.delete('/delete',(req,res)=>{
    res.send('aca se borran los turnos pai...')
})




module.exports = turnosRouter;