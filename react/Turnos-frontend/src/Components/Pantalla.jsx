import React, { useEffect, useState } from 'react';
import { Modal, Table, Tag, Layout } from 'antd';
import io from 'socket.io-client';
import '../css/PantallaAtencion.css';
import video from '../assets/Video.mp4';

const { Sider, Content } = Layout;

const PantallaAtencion = () => {
  const [turnos, setTurnos] = useState([]);
  const [turnoLlamado, setTurnoLlamado] = useState(null);
  const [turnoEnCurso, setTurnoEnCurso] = useState([]);

  useEffect(() => {
    const socket = io('https://xn--urkupia-9za.online'); // Ajusta la URL si es necesario

    // Función para actualizar los turnos
    const updateTurnos = (data) => {
      const today = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD
      const enCurso = data.filter(turno => turno.status === 'en_curso');
      const pendientes = data.filter(turno => {
        const turnoFecha = new Date(turno.fecha).toISOString().split('T')[0];
        return turno.status === 'pendiente' && turnoFecha === today;
      });
      setTurnoEnCurso(enCurso);
      setTurnos(pendientes);
    };

    // Escuchar el evento 'turnos' para actualizar la lista de turnos
    socket.on('turnos', updateTurnos);

    // Escuchar el evento 'turnoLlamado'
    socket.on('turnoLlamado', (turno) => {
      setTurnoLlamado(turno);
      setTurnoEnCurso((prev) => [...prev, turno]);
      setTurnos((prev) => prev.filter(t => t.id !== turno.id));
      setTimeout(() => {
        setTurnoLlamado(null);
      }, 2000);
    });

    // Emitir un evento para solicitar los turnos actualizados cada 20 segundos
    const intervalId = setInterval(() => {
      socket.emit('requestTurnos'); // Emitir un evento para solicitar los turnos actualizados
    }, 20000); // 20000 ms = 20 segundos

    // Emitir el evento inicialmente para obtener los datos cuando se carga el componente
    socket.emit('requestTurnos');

    // Limpieza del socket y el intervalo en el desmontaje del componente
    return () => {
      socket.off('turnos');
      socket.off('turnoLlamado');
      clearInterval(intervalId);
      socket.disconnect(); // Cerrar la conexión del socket
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
              src={video}
              autoPlay={true}
              muted
              controls
              className="video-element"
            />
            <div className="image-sections">
              <div className="image-section">
                {/* <img src={logo} alt="Logo.jpg"/> */}
              </div>
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
              { title: 'Usuario', dataIndex: 'user_name', key: 'user_name' },
            ]}
            pagination={false}
            rowKey="id"
          />
        </Sider>
      </Layout>
      <Modal
        title={<span style={{ fontSize: '24px', color: '#333' }}>Turno Llamado</span>}
        visible={!!turnoLlamado}
        footer={null}
        centered
        onCancel={() => setTurnoLlamado(null)}
        style={{
          backgroundColor: '#f5f5f5',
          borderRadius: '10px',
          padding: '20px',
        }}
      >
        {turnoLlamado && (
          <>
            <p style={{ fontSize: '18px', color: '#555', marginBottom: '10px' }}><strong>Código de Reserva:</strong> {turnoLlamado.cod_reserva}</p>
            <p style={{ fontSize: '18px', color: '#555', marginBottom: '10px' }}><strong>Usuario:</strong> {turnoLlamado.user_name}</p>
            <p style={{ fontSize: '18px', color: '#555', marginBottom: '10px' }}><strong>Motivo:</strong> {turnoLlamado.motivo}</p>
            <p style={{ fontSize: '18px', color: '#555', marginBottom: '10px' }}><strong>Estado:</strong> {turnoLlamado.status}</p>
          </>
        )}
      </Modal>
    </Layout>
  );
};

export default PantallaAtencion;
