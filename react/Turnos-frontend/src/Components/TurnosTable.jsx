import React, { useEffect, useState, useMemo } from 'react';
import { Table, Input, Button, Tag } from 'antd';
import { io } from 'socket.io-client';

const socketURL = 'https://xn--urkupia-9za.online';

const columns = [
  { title: 'Nombre', dataIndex: 'user_name', key: 'user_name' },
  { title: 'Código', dataIndex: 'cod_reserva', key: 'cod_reserva' },
  { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: f => new Date(f).toLocaleDateString() },
  { title: 'Hora', dataIndex: 'hora', key: 'hora' },
  { title: 'Motivo', dataIndex: 'motivo', key: 'motivo' },
  { 
    title: 'Estado', dataIndex: 'status', key: 'status', 
    render: s => (
      <Tag color={
        s === 'pendiente' ? 'gold'
        : s === 'en_curso' ? 'green'
        : s === 'cancelado' ? 'red'
        : 'blue'
      }>{s}</Tag>
    )
  }
];

const TurnosTable = () => {
  const [turnos, setTurnos] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Solo 1 instancia del socket por tabla
  const socket = useMemo(() => io(socketURL, {
    transports: ['websocket'],
    pingInterval: 25000,
    pingTimeout: 20000,
    maxPayload: 1000000
  }), []);

  useEffect(() => {
    const handleTurnos = (turnos) => setTurnos(turnos);

    // 1) Siempre pedimos apenas se monta
    socket.emit('obtenerTurnos');

    // 2) Pedimos cada 2 segundos
    const interval = setInterval(() => {
      socket.emit('obtenerTurnos');
    }, 2000);

    socket.on('connect', () => console.log('Socket conectado!'));
socket.on('turnos', (turnos) => console.log('Turnos recibidos:', turnos));
socket.on('connect_error', (err) => console.log('Error conexión socket:', err));


    socket.on('turnos', handleTurnos);

    return () => {
      clearInterval(interval);
      socket.off('turnos', handleTurnos);
      socket.disconnect();
    };
  }, [socket]);

  const filtered = (turnos || []).filter(t =>
    (!search || t.user_name?.toLowerCase().includes(search.toLowerCase()) || t.cod_reserva?.toLowerCase().includes(search.toLowerCase()))
    && (!status || t.status === status)
  );

  return (
    <div>
      <div style={{ margin: '16px 0', display: 'flex', gap: 8 }}>
        <Input
          placeholder="Buscar por nombre o código"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 250 }}
        />
        <Input
          placeholder="Estado (pendiente, en_curso, cancelado)"
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ width: 200 }}
        />
        <Button onClick={() => { setSearch(''); setStatus(''); }}>Limpiar</Button>
      </div>
      <Table
        dataSource={filtered.map((t, i) => ({ ...t, key: i }))}
        columns={columns}
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
};

export default TurnosTable;
