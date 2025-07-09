import React, { useEffect, useState, useRef } from 'react';
import { Table, Modal } from 'antd';
import { AnimatePresence, motion } from "framer-motion";
import io from 'socket.io-client';
import '../css/PantallaAtencion.css';
import video from '../assets/Video.mp4';
import logo from '../assets/LOGONUEVO.png';
import publi1 from '../assets/avatar.jpg';
import publi2 from '../assets/logo.jpg';
import publi3 from '../assets/icon.png';
import publi4 from '../assets/logo_64.png';

const PUBLICIDADES = [
  { id: 1, img: publi1 },
  { id: 2, img: publi2 },
  { id: 3, img: publi3 },
  { id: 4, img: publi4 }
];

const columns = [
  {
    title: <span className="tabla-header">Turno</span>,
    dataIndex: 'cod_reserva',
    key: 'cod_reserva',
    render: text => <span className="tabla-turno">{text}</span>
  },
  {
    title: <span className="tabla-header">Caja</span>,
    dataIndex: 'caja',
    key: 'caja',
    align: 'center',
    render: text => <span className="tabla-caja">{text}</span>
  }
];

const PantallaAtencion = () => {
  const [turnos, setTurnos] = useState([]);
  const [turnoLlamado, setTurnoLlamado] = useState(null);
  const [currentPubli, setCurrentPubli] = useState(0);
  const publiTimeout = useRef(null);

  // SOCKET TURNOS
  useEffect(() => {
    const socket = io('https://xn--urkupia-9za.online');
    socket.on('turnos', (data) => setTurnos(data));
    socket.on('turnoLlamado', (turno) => {
      setTurnoLlamado(turno);
      setTimeout(() => setTurnoLlamado(null), 2000);
    });
    socket.emit('requestTurnos');
    const intervalId = setInterval(() => socket.emit('requestTurnos'), 20000);
    return () => {
      socket.disconnect();
      clearInterval(intervalId);
    };
  }, []);

  // SLIDER con animación
  useEffect(() => {
    publiTimeout.current = setTimeout(() => {
      setCurrentPubli(prev => (prev + 1) % PUBLICIDADES.length);
    }, 6000);
    return () => clearTimeout(publiTimeout.current);
  }, [currentPubli]);

  // SOLO TURNOS DE HOY Y PENDIENTES
  const hoy = new Date().toISOString().split('T')[0];
  const turnosPendientesHoy = (turnos || []).filter(t =>
    t.status === 'pendiente' && new Date(t.fecha).toISOString().split('T')[0] === hoy
  );

  return (
    <div className="pantalla-bg">
      {/* HEADER CON LOGO */}
      <header className="pantalla-header">
        <img src={logo} alt="Urkupiña" className="pantalla-header-logo" style={{width:100,height:70}} />
      </header>

      {/* BLOQUE PRINCIPAL */}
      <div className="pantalla-block-figma">
        <div className="pantalla-block-figma-content">
          <video
            src={video}
            autoPlay
            muted
            controls
            className="pantalla-block-figma-video"
          />
          <div className="pantalla-block-figma-tabla">
            <Table
              dataSource={turnosPendientesHoy.map((t, i) => ({ ...t, key: i }))}
              columns={columns}
              pagination={false}
              bordered={false}
              className="pantalla-turnos-table"
              locale={{ emptyText: "—" }}
            />
          </div>
        </div>
        {/* SLIDER PUBLICIDAD ABAJO, SOLO IMAGEN */}
        <footer className="pantalla-footer-slider">
          <div className="publi-carousel">
            <AnimatePresence mode="wait">
              <motion.img
                key={PUBLICIDADES[currentPubli].id}
                src={PUBLICIDADES[currentPubli].img}
                alt="Publicidad"
                className="publi-slider-img"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.7, type: "spring" }}
              />
            </AnimatePresence>
          </div>
        </footer>
      </div>

      {/* MODAL TURNO LLAMADO */}
      <Modal
        open={!!turnoLlamado}
        title="Turno Llamado"
        footer={null}
        centered
        onCancel={() => setTurnoLlamado(null)}
      >
        {turnoLlamado && (
          <div>
            <p><b>Turno:</b> {turnoLlamado.cod_reserva}</p>
            <p><b>Caja:</b> {turnoLlamado.caja}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PantallaAtencion;
