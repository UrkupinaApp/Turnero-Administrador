import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Tag } from 'antd';
import io from 'socket.io-client';

// Configurá tu socket
const socket = io('https://xn--urkupia-9za.online', {
  transports: ['websocket'],
  pingInterval: 25000,
  pingTimeout: 20000,
  maxPayload: 1000000
});

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

const TurnosTable = ({ locationKey }) => {
  const [turnos, setTurnos] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Al cambiar de ruta, volver a pedir los turnos
    socket.emit('obtenerTurnos');
    const handleTurnos = data => setTurnos(data);
    socket.on('turnos', handleTurnos);
    return () => socket.off('turnos', handleTurnos);
  }, [locationKey]); // <--- Este es el truco

  // Filtro simple
  const filtered = turnos.filter(t =>
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
