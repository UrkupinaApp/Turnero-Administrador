import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRouter from './Routes/PrivateRouter';
import Home from './Components/Home';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import PublicRouter  from './Routes/PublicRouter';
import  Creditos  from './Components/Creditos';
import Clientes from './Components/Clientes';
import PantallaAtencion from './Components/Pantalla';

const App = () => {
  return (
    <AuthProvider>
   
        <Routes>
          
          <Route path='/' element={<PublicRouter/>}>
          <Route  index path='/' element={<Login/>}/>
          <Route path='/pantalla' element={<PantallaAtencion/>}/>

          </Route>
          <Route path='/private' element={<PrivateRouter />}>
            <Route path="/private/dashboard" element={<Dashboard />} />
            <Route path="/private/home" element={<Home />} />
            <Route path = "/private/creditos" element={<Creditos/>}/>
            <Route path='/private/clientes' element={<Clientes/>}/>
          </Route>
        </Routes>
      
    </AuthProvider>
  );
};

export default App;
