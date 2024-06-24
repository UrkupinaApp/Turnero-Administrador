import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRouter from './Routes/PrivateRouter';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PublicRouter  from './Routes/PublicRouter';

const App = () => {
  return (
    <AuthProvider>
   
        <Routes>
          
          <Route path='/' element={<PublicRouter/>}>
          <Route  index path='/login' element={<Login/>}/>

          </Route>
          <Route path='/private' element={<PrivateRouter />}>
            <Route path="/private/dashboard" element={<Dashboard />} />
            <Route path="/private/home" element={<Home />} />
          </Route>
        </Routes>
      
    </AuthProvider>
  );
};

export default App;
