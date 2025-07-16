import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import Turnos from '../Components/Turnos';
import TurnosTable from '../Components/TurnosTable';
import AppLayout from './CustomLayout';

const socketURL = 'https://xn--urkupia-9za.online';

const STORAGE_KEY = "turnos_urkupina";

const Home = () => {
  const location = useLocation();
  const [turnos, setTurnos] = useState(() => {
    // Cargar los turnos guardados si hay algo en localStorage
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    return fromStorage ? JSON.parse(fromStorage) : [];
  });

  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [turnosEnCurso, setTurnosEnCurso] = useState([]);

  const socket = useMemo(() => io(socketURL, {
    transports: ['websocket'],
    pingInterval: 25000,
    pingTimeout: 20000,
    maxPayload: 1000000
  }), []);

  useEffect(() => {
    const handleTurnos = (turnos) => {
      setTurnos(turnos);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
      const hoy = new Date().toISOString().split('T')[0];
      setTurnosDisponibles(
        turnos.filter(
          t => t.status === 'pendiente' && new Date(t.fecha).toISOString().split('T')[0] === hoy
        )
      );
      setTurnosEnCurso(turnos.filter(t => t.status === 'en_curso'));
    };

    // Refrescar cada 10 segundos
    const intervalId = setInterval(() => {
      socket.emit('obtenerTurnos');
    }, 10000);

    socket.on('turnos', handleTurnos);

    // Pedir turnos de una vez al montar
    socket.emit('obtenerTurnos');

    return () => {
      clearInterval(intervalId);
      socket.off('turnos', handleTurnos);
    };
  }, [socket, location.key]);

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
        {/* La tabla ahora lee los turnos desde localStorage */}
        <TurnosTable />
      </div>
    </AppLayout>
  );
};

export default Home;
