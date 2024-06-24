import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import AppLayout from './CustomLayout';
import Turnos from './Turnos';
import '../css/Turnos.css'
const Home = () => {
  const { Logout, incrementCounter, counter } = useAuthContext();

  return (
    <div className='home'>
     <AppLayout>
      <h1>App </h1>
      <Turnos></Turnos>
     </AppLayout>
    </div>
  );
};

export default Home;
