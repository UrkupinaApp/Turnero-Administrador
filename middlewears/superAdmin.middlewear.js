const jwt = require('jsonwebtoken');

// Middleware para verificar el rol del usuario
const verifyRole = (req,res,next) => {
    const token = req.headers.authorization;
    if(!token){
        res.status(401).json({message:"token no proporcionado"})
    }else{
        jwt.verify(token,process.env.JWT_SECRET,(err,result)=>{
            
            if(err){
                res.status(401).json({message:"token invalido"})
            }
            if(result.rol !== "superadmin"){
                res.status(403).json({message:"ruta restringida"})
            }
        })
    }
    
    next()
};





module.exports = {verifyRole};
