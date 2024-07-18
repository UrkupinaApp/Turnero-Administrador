import React from 'react';
import { Card, Button, Row, Col } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import '../css/Turnos.css';

function Turnos({ turnosDisponibles, turnosEnCurso, socket }) {

  const llamarTurno = (id) => {
    socket.emit('llamarTurno', id);
  };

  const completarTurno = (id) => {
    socket.emit('completarTurno', id);
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
      <h2>Turnos Esperando ser llamados2</h2>
      <Row gutter={[16, 16]}>
        {turnosDisponibles.map((turno) => (
          <Col span={8} key={turno.id}>
            {renderTurnoCard(turno, false)}
          </Col>
        ))}
      </Row>

      <h2>Turnos en Curso</h2>
      <Row gutter={[16, 16]}>
        {turnosEnCurso.map((turno) => (
          <Col span={8} key={turno.id}>
            {renderTurnoCard(turno, true)}
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Turnos;
