import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Modal, Tabs } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Turnos.css';

const { TabPane } = Tabs;

function Turnos({ socket }) {
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [turnosEnCurso, setTurnosEnCurso] = useState([]);
  const [turnoLlamado, setTurnoLlamado] = useState(null);
  const [visible, setVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Función para actualizar los turnos
    const updateTurnos = (turnos) => {
      const today = new Date().toISOString().split('T')[0];
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

    socket.on('turnos', updateTurnos);

    socket.on('turnoLlamado', (turno) => {
      setTurnoLlamado(turno);
      setVisible(true);

      setTurnosDisponibles(prevTurnos => prevTurnos.filter(t => t.id !== turno.id));
      setTurnosEnCurso(prevTurnos => [...prevTurnos, { ...turno, status: 'en_curso' }]);

      setTimeout(() => {
        setVisible(false);
      }, 4000);
    });

    const intervalId = setInterval(() => {
      socket.emit('requestTurnos');
    }, 3000);

    socket.emit('requestTurnos');

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
    setTurnosEnCurso(prevTurnos => prevTurnos.filter(t => t.id !== id));
  };

  const renderTurnoCard = (turno, isEnCurso) => (
    <Card
      key={turno.id}
      className="turno-card"
      actions={[
        <Button onClick={() => isEnCurso ? completarTurno(turno.id) : llamarTurno(turno.id)}>
          {isEnCurso ? 'Completar' : 'Llamar'}
        </Button>
      ]}
      bordered={false}
    >
      <Card.Meta
        avatar={isEnCurso ? <CheckCircleOutlined style={{ color: 'green' }} /> : <ClockCircleOutlined style={{ color: 'orange' }} />}
        title={<span style={{ fontWeight: 600 }}>Usuario: {turno.user_name}</span>}
        description={
          <div>
            <span className="desc-label">Código:</span> {turno.cod_reserva}<br/>
            <span className="desc-label">Estado:</span> {turno.status}<br/>
            <span className="desc-label">Motivo:</span> {turno.motivo}
          </div>
        }
      />
    </Card>
  );

 
  return (
    <div className="turnos-page">
    

      <div className="main-turnos-card">
        <div className="turnos-section">
          <h3 className="turnos-section-title">Turnos Pendientes para Hoy</h3>
          <Row gutter={[8, 8]}>
            {turnosDisponibles.length > 0 ? (
              turnosDisponibles.map((turno) => (
                <Col span={24} key={turno.id}>
                  {renderTurnoCard(turno, false)}
                </Col>
              ))
            ) : (
              <Col span={24}><p className="turnos-empty">No hay turnos pendientes para hoy</p></Col>
            )}
          </Row>
        </div>

        <div className="turnos-section">
          <h3 className="turnos-section-title">Turnos en Curso</h3>
          <Row gutter={[8, 8]}>
            {turnosEnCurso.length > 0 ? (
              turnosEnCurso.map((turno) => (
                <Col span={24} key={turno.id}>
                  {renderTurnoCard(turno, true)}
                </Col>
              ))
            ) : (
              <Col span={24}><p className="turnos-empty">No hay turnos en curso</p></Col>
            )}
          </Row>
        </div>
      </div>

      <Modal
        title="Turno Llamado"
        open={visible}
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
