import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRouter from './Routes/PrivateRouter';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PublicRouter  from './Routes/PublicRouter';
import  Creditos  from './Components/Creditos';
import Clientes from './Components/Clientes';
import Pantalla from './Components/Pantalla';
import PantallaAtencion from './Components/Pantalla';

const App = () => {
  return (
    <AuthProvider>
   
        <Routes>
          
          <Route path='/' element={<PublicRouter/>}>
          <Route  index path='/' element={<Login/>}/>

          </Route>
          <Route path='/private' element={<PrivateRouter />}>
            <Route path="/private/dashboard" element={<Dashboard />} />
            <Route path="/private/home" element={<Home />} />
            <Route path = "/private/creditos" element={<Creditos/>}/>
            <Route path='/private/clientes' element={<Clientes/>}/>
            <Route path='/private/pantalla' element={<PantallaAtencion/>}/>
          </Route>
        </Routes>
      
    </AuthProvider>
  );
};

export default App;
