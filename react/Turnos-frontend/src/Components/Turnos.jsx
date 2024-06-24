// Turnos.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import '../css/Turnos.css'

const socket = io('http://localhost:3005', {
  transports: ['websocket'], // Usar websocket como el transporte
  pingInterval: 25000,       // Intervalo de ping
  pingTimeout: 20000,        // Timeout de ping
  maxPayload: 1000000        // Tamaño máximo de payload
});

function Turnos() {
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [turnosEnCurso, setTurnosEnCurso] = useState([]);

  useEffect(() => {
    socket.on('turnos', (data) => {
        console.log("esta es la data de disponibles",data.disponibles)
      setTurnosDisponibles(data.disponibles);
      setTurnosEnCurso(data.enCurso);
      console.log(turnosDisponibles)
      console.log(turnosEnCurso)
    });

    return () => {
      socket.off('turnos');
    };
  }, []);

  const llamarTurno = (id) => {
    socket.emit('llamarTurno', id);
  };

  const completarTurno = (id) => {
    socket.emit('completarTurno', id);
  };

  return (
    <div className='content'>
      <h2>Turnos Esperando ser llamados</h2>
      <ul>
        {turnosDisponibles.map((turno) => (
          <li key={turno.id} className='turno-item'>
            Usuario: {turno.user_name} Codigo: {turno.cod_reserva} Estado : {turno.status} Motivo : {turno.motivo}
            <button onClick={() => llamarTurno(turno.id)} className='turno-call'>Llamar</button>
          </li>
        ))}
      </ul>

      <h2>Turnos en Curso</h2>
      <ul>
        {turnosEnCurso.map((turno) => (
          <li key={turno.id} className='turno-item'>
            Usuario: {turno.user_name}  Codigo: {turno.cod_reserva}  Estado: {turno.status}  Motivo:{turno.motivo}
            <button onClick={() => completarTurno(turno.id)} className='button-completar'>Completar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Turnos;
