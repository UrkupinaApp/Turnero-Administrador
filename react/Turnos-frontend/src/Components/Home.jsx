import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import io from 'socket.io-client';
import Turnos from '../Components/Turnos';
import TurnosTable from '../Components/TurnosTable'; // <--- IMPORTA TU TABLA
import AppLayout from './CustomLayout';

const socket = io('https://xn--urkupia-9za.online', {
  transports: ['websocket'],
  pingInterval: 25000,
  pingTimeout: 20000,
  maxPayload: 1000000
});

const Home = () => {
  const location = useLocation();
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [turnosEnCurso, setTurnosEnCurso] = useState([]);

  useEffect(() => {
    const handleTurnos = (turnos) => {
      const hoy = new Date().toISOString().split('T')[0];
      const disponibles = turnos.filter(
        t => t.status === 'pendiente' && new Date(t.fecha).toISOString().split('T')[0] === hoy
      );
      const enCurso = turnos.filter(t => t.status === 'en_curso');
      setTurnosDisponibles(disponibles);
      setTurnosEnCurso(enCurso);
    };

    socket.emit('obtenerTurnos');
    socket.on('turnos', handleTurnos);

    return () => {
      socket.off('turnos', handleTurnos);
    };
  }, [location.pathname]);

  return (
    <AppLayout>
      <div>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: 24,
          marginTop: 0
        }}>Turnos</h1>
        <Turnos
          turnosDisponibles={turnosDisponibles}
          turnosEnCurso={turnosEnCurso}
          socket={socket}
        />
        {/* Aca la tabla justo debajo de Turnos */}
        <TurnosTable locationKey={location.key} />
      </div>
    </AppLayout>
  );
};

export default Home;
