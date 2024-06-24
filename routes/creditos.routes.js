const Express = require('express')

const creditosRouter = Express.Router()


const {carga_credito, descarga_credito, obtenerCreditosUsuario} = require('../controllers/creditos.controllers')
const adminMiddlewear = require('../middlewears/admin.middlewear')

creditosRouter.get('/',(req,res)=>{
    res.send('creditos...')
})

creditosRouter.post("/carga/:id",adminMiddlewear,carga_credito)

creditosRouter.put("/update/:id",descarga_credito)

creditosRouter.get("/:id",obtenerCreditosUsuario)








module.exports= creditosRouter;