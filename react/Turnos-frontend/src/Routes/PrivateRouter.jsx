import { useAuthContext } from '../context/AuthContext'
import{Navigate,Outlet} from 'react-router-dom'


const PrivateRouter = () => {

    const {Authenticated} = useAuthContext()

    

    if(!Authenticated){
        return <Navigate to={"/"}/>
    }
            return(<div><Outlet/></div>)
    
  
}


export default PrivateRouter; // Asegúrate de exportar por defecto