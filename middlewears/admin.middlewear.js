const jwt = require('jsonwebtoken');


const adminMiddlewear = (req,res,next)=>{

    const token = req.headers.authorization;

    if(!token){
        res.status(401).json({message:"Token Requerido!.."})
    }else{
        jwt.verify(token,process.env.JWT_SECRET,(err,result)=>{
            if(err){
                res.status(401).json({message:"Token invalido.."})
            }
            if(result.rol !== "admin" ){
                res.status(403).json({message:"Ruta Restringida.."})
            }
        })
        next()
    }

}


module.exports = adminMiddlewear;