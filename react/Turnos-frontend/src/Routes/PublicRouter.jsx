import { useAuthContext } from "../context/AuthContext"

import{Navigate,Outlet} from 'react-router-dom'

const PublicRouter = () => {

    const {Authenticated} = useAuthContext()



    if(Authenticated){
        return <Navigate to={"/private/home"}/>
    }
            return(<div><Outlet/></div>)
    
  
}


export default PublicRouter;