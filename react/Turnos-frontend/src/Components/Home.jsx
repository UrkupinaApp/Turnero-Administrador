import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Turnos from './Turnos.jsx';
import AppLayout from './CustomLayout';

const socket = io('http://localhost:3005', {
  transports: ['websocket'], // Usar websocket como el transporte
  pingInterval: 25000,       // Intervalo de ping
  pingTimeout: 20000,        // Timeout de ping
  maxPayload: 1000000        // Tamaño máximo de payload
});

const Home = () => {
  const location = useLocation();
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [turnosEnCurso, setTurnosEnCurso] = useState([]);

  useEffect(() => {
    const fetchTurnos = () => {
      socket.emit('obtenerTurnos');
    };

    fetchTurnos();

    socket.on('turnos', (data) => {
      console.log("Esta es la data de disponibles", data.disponibles);
      setTurnosDisponibles(data.disponibles);
      setTurnosEnCurso(data.enCurso);
    });

    return () => {
      socket.off('turnos');
    };
  }, [location.pathname]); // Dependencia en 'location.pathname' para que se ejecute al cambiar la ruta

  return (
    <AppLayout>
      <div>
        
        <Turnos
          turnosDisponibles={turnosDisponibles}
          turnosEnCurso={turnosEnCurso}
          socket={socket}
        />
      </div>
    </AppLayout>
  );
};

export default Home;
