import React, { useEffect, useState } from 'react';
import { Modal, Card, Table, Tag, Layout } from 'antd';
import io from 'socket.io-client';
import '../css/PantallaAtencion.css';

const { Sider, Content } = Layout;
const socket = io('https://xn--urkupia-9za.online'); // Ajusta la URL si es necesario

const PantallaAtencion = () => {
  const [turnos, setTurnos] = useState([]);
  const [turnoLlamado, setTurnoLlamado] = useState(null);
  const [turnoEnCurso, setTurnoEnCurso] = useState([]);

  useEffect(() => {
    // Escuchar el evento 'turnos' para actualizar la lista de turnos
    socket.on('turnos', (data) => {
      const enCurso = data.filter(turno => turno.status === 'en_curso');
      const pendientes = data.filter(turno => turno.status === 'pendiente');
      setTurnoEnCurso(enCurso);
      setTurnos(pendientes);
    });

    // Escuchar el evento 'turnoLlamado'
    socket.on('turnoLlamado', (turno) => {
      setTurnoLlamado(turno);
      setTurnoEnCurso((prev) => [...prev, turno]);
      setTurnos((prev) => prev.filter(t => t.id !== turno.id));
      setTimeout(() => {
        setTurnoLlamado(null);
      }, 4000);
    });

    return () => {
      socket.off('turnos');
      socket.off('turnoLlamado');
    };
  }, []);

  return (
    <Layout className="h-screen">
      <Sider width={300} className="sider-bar">
        <h2 className="sider-title">Turnos Pendientes</h2>
        <Table
          dataSource={turnos}
          columns={[
            { title: 'Código de Reserva', dataIndex: 'cod_reserva', key: 'cod_reserva' },
            {
              title: 'Estado',
              dataIndex: 'status',
              key: 'status',
              render: status => {
                let color = status === 'pendiente' ? 'green' : 'volcano';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
              }
            }
          ]}
          pagination={false}
          rowKey="id"
        />
      </Sider>
      <Layout>
        <Content className="main-content">
          <div className="video-container">
            <video
              src="https://www.youtube.com/watch?v=9OczYz0ZO2A"
              controls
              className="video-element"
            />
            <div className="image-sections">
              <div className="image-section">Imagen 1</div>
              <div className="image-section">Imagen 2</div>
              <div className="image-section">Imagen 3</div>
            </div>
          </div>
        </Content>
        <Sider width={300} className="sider-bar-right">
          <h2 className="sider-title">Turnos en Curso</h2>
          <Table
            dataSource={turnoEnCurso}
            columns={[
              { title: 'Código de Reserva', dataIndex: 'cod_reserva', key: 'cod_reserva' },
              {
                title: 'Usuario',
                dataIndex: 'user_name',
                key: 'user_name',
              },
            ]}
            pagination={false}
            rowKey="id"
          />
        </Sider>
      </Layout>
      <Modal
        title="Turno Llamado"
        visible={!!turnoLlamado}
        footer={null}
        centered
        onCancel={() => setTurnoLlamado(null)}
      >
        {turnoLlamado && (
          <>
            <p><strong>Código de Reserva:</strong> {turnoLlamado.cod_reserva}</p>
            <p><strong>Usuario:</strong> {turnoLlamado.user_name}</p>
            <p><strong>Motivo:</strong> {turnoLlamado.motivo}</p>
            <p><strong>Estado:</strong> {turnoLlamado.status}</p>
          </>
        )}
      </Modal>
    </Layout>
  );
};

export default PantallaAtencion;
