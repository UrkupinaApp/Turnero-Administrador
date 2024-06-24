const express = require('express');
const { getCajas } = require('../controllers/cajas.controllers');

const cajasRouter = express.Router()



cajasRouter.get('/',getCajas)






module.exports =cajasRouter;