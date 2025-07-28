import React, { useEffect, useState } from 'react';
import { Button, Spin, Alert, message } from 'antd';
import QRCode from 'qrcode.react';
import AppLayout from './CustomLayout';

export default function WhatsAppAuth() {
  const [connected, setConnected] = useState(null);
  const [qrValue, setQrValue] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/qr');
      const data = await res.json();
      if (data.authenticated) {
        setConnected(true);
      } else if (data.qr) {
        setConnected(false);
        setQrValue(data.qr);
      } else {
        setConnected(false);
        setQrValue('');
      }
    } catch (e) {
      console.error('Error fetching QR status:', e);
      setConnected(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/logout');
      const data = await res.json();
      message.success(data.message || 'Sesión desconectada.');
      setConnected(null);
      setQrValue('');
      fetchStatus();
    } catch (e) {
      message.error('Error de red al intentar desconectar.');
    }
  };

  const renderQRCode = () => {
    if (!qrValue) return <Spin tip="Generando QR..." />;
    // Si el valor es un dataURL (imagen), renderiza <img>
    if (qrValue.startsWith('data:image')) {
      return <img src={qrValue} alt="QR Code" style={{ width: 256, height: 256 }} />;
    }
    // De lo contrario, usa QRCode.react para generar
    return <QRCode value={qrValue} size={256} />;
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
        <h2>Autenticación de WhatsApp</h2>

        {connected === null && <Spin tip="Cargando estado..." />}

        {connected === true && (
          <Alert
            message="Bot autenticado ✔️"
            description="Puedes usar el servicio por WhatsApp."
            type="success"
            showIcon
            style={{ margin: '1rem 0' }}
          />
        )}

        {connected === false && (
          <>
            <Alert
              message="Escanea el código"
              description="Abre WhatsApp en tu teléfono y escanea este código QR."
              type="info"
              showIcon
              style={{ marginBottom: '1rem' }}
            />
            {renderQRCode()}
          </>
        )}

        <Button
          type="primary"
          danger
          block
          style={{ marginTop: 24 }}
          onClick={handleLogout}
        >
          Desconectar sesión
        </Button>
      </div>
    </AppLayout>
  );
}
