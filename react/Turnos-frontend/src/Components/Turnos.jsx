import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Modal } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import '../css/Turnos.css';

function Turnos({ socket }) {
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [turnosEnCurso, setTurnosEnCurso] = useState([]);
  const [turnoLlamado, setTurnoLlamado] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Función para actualizar los turnos
    const updateTurnos = (turnos) => {
      const today = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD
      const disponibles = turnos.filter(
        (turno) => {
          const turnoFecha = new Date(turno.fecha).toISOString().split('T')[0];
          return turno.status === 'pendiente' && turnoFecha === today;
        }
      );
      const enCurso = turnos.filter(turno => turno.status === 'en_curso');
      setTurnosDisponibles(disponibles);
      setTurnosEnCurso(enCurso);
    };

    // Escuchar el evento de turnos desde el socket
    socket.on('turnos', updateTurnos);

    // Escuchar el evento de turno llamado desde el socket
    socket.on('turnoLlamado', (turno) => {
      setTurnoLlamado(turno);
      setVisible(true);

      // Mover el turno a "en curso" inmediatamente
      setTurnosDisponibles(prevTurnos => prevTurnos.filter(t => t.id !== turno.id));
      setTurnosEnCurso(prevTurnos => [...prevTurnos, { ...turno, status: 'en_curso' }]);

      // Ocultar el popup después de 4 segundos
      setTimeout(() => {
        setVisible(false);
      }, 4000);
    });

    // Emitir un evento para solicitar los turnos actualizados cada 3 segundos
    const intervalId = setInterval(() => {
      socket.emit('requestTurnos'); // Emitir un evento para solicitar los turnos actualizados
    }, 3000); // 3000 ms = 3 segundos

    // Emitir el evento inicialmente para obtener los datos cuando se carga el componente
    socket.emit('requestTurnos');

    // Limpieza del socket y el intervalo en el desmontaje del componente
    return () => {
      socket.off('turnos');
      socket.off('turnoLlamado');
      clearInterval(intervalId);
    };
  }, [socket]);

  const llamarTurno = (id) => {
    socket.emit('llamarTurno', id);
  };

  const completarTurno = (id) => {
    socket.emit('completarTurno', id);
    // Actualizar los estados de los turnos en la UI
    setTurnosEnCurso(prevTurnos => prevTurnos.filter(t => t.id !== id));
  };

  const renderTurnoCard = (turno, isEnCurso) => (
    <Card
      key={turno.id}
      style={{ marginBottom: 16 }}
      actions={[
        <Button onClick={() => isEnCurso ? completarTurno(turno.id) : llamarTurno(turno.id)}>
          {isEnCurso ? 'Completar' : 'Llamar'}
        </Button>
      ]}
    >
      <Card.Meta
        avatar={isEnCurso ? <CheckCircleOutlined style={{ color: 'green' }} /> : <ClockCircleOutlined style={{ color: 'orange' }} />}
        title={`Usuario: ${turno.user_name}`}
        description={
          <>
            <p>Código: {turno.cod_reserva}</p>
            <p>Estado: {turno.status}</p>
            <p>Motivo: {turno.motivo}</p>
          </>
        }
      />
    </Card>
  );

  return (
    <div className='content'>
      <h2>Turnos Pendientes para Hoy</h2>
      <Row gutter={[16, 16]}>
        {turnosDisponibles.length > 0 ? (
          turnosDisponibles.map((turno) => (
            <Col span={8} key={turno.id}>
              {renderTurnoCard(turno, false)}
            </Col>
          ))
        ) : (
          <Col span={24}><p>No hay turnos pendientes para hoy</p></Col>
        )}
      </Row>

      <h2>Turnos en Curso</h2>
      <Row gutter={[16, 16]}>
        {turnosEnCurso.length > 0 ? (
          turnosEnCurso.map((turno) => (
            <Col span={8} key={turno.id}>
              {renderTurnoCard(turno, true)}
            </Col>
          ))
        ) : (
          <Col span={24}><p>No hay turnos en curso</p></Col>
        )}
      </Row>

      {/* Popup para mostrar el turno llamado */}
      <Modal
        title="Turno Llamado"
        visible={visible}
        footer={null}
        onCancel={() => setVisible(false)}
      >
        {turnoLlamado && (
          <>
            <p><strong>Usuario:</strong> {turnoLlamado.user_name}</p>
            <p><strong>Código:</strong> {turnoLlamado.cod_reserva}</p>
            <p><strong>Motivo:</strong> {turnoLlamado.motivo}</p>
            <p><strong>Estado:</strong> {turnoLlamado.status}</p>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Turnos;
