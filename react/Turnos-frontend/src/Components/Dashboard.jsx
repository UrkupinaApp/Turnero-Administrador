import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import AppLayout from './CustomLayout';

const SOCKET_URL = 'https://xn--urkupia-9za.online';
const WEATHER_API_KEY = "b88e5702b8581c7fd6602ebcc2f3bf6c";
const CITY = "Bahia Blanca";
const COUNTRY = "AR";

const Dashboard = () => {
  // Datos y estados
  const [turnos, setTurnos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mensajeMasivo, setMensajeMasivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviandoMasivo, setEnviandoMasivo] = useState(false);

  // Hora y saludo
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const getSaludo = () => {
    const h = time.getHours();
    if (h < 7) return "¡Buenas noches!";
    if (h < 13) return "¡Buen día!";
    if (h < 20) return "¡Buenas tardes!";
    return "¡Buenas noches!";
  };

  // Clima
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&appid=${WEATHER_API_KEY}&units=metric&lang=es`)
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(() => setWeather(null));
  }, []);

  // Socket turnos
  const socket = useMemo(() => io(SOCKET_URL, {
    transports: ['websocket'],
    pingInterval: 25000,
    pingTimeout: 20000,
    maxPayload: 1000000
  }), []);

  useEffect(() => {
    const handleTurnos = (data) => setTurnos(data);
    socket.emit('obtenerTurnos');
    socket.on('turnos', handleTurnos);

    const interval = setInterval(() => {
      socket.emit('obtenerTurnos');
    }, 10000);

    return () => {
      socket.off('turnos', handleTurnos);
      clearInterval(interval);
      socket.disconnect();
    };
  }, [socket]);

  // Obtener usuarios para buscador individual (solo una vez)
  useEffect(() => {
    fetch(`${SOCKET_URL}/api/users/`)
      .then(r => r.json())
      .then(data => setUsuarios(data))
      .catch(() => setUsuarios([]));
  }, []);

  // HOY
  const hoyISO = new Date().toISOString().split('T')[0];
  // Turnos pendientes hoy
  const pendientesHoy = turnos.filter(t =>
    t.status === 'pendiente' &&
    new Date(t.fecha).toISOString().split('T')[0] === hoyISO
  );
  // Turnos completados hoy
  const completadosHoy = turnos.filter(t =>
    t.status === 'completado' &&
    new Date(t.fecha).toISOString().split('T')[0] === hoyISO
  );
  // Próximo turno (pendiente y futuro)
  const ahora = new Date();
  const proximoTurno = pendientesHoy
    .map(t => ({ ...t, dt: new Date(`${t.fecha}T${t.hora}`) }))
    .filter(t => t.dt >= ahora)
    .sort((a, b) => a.dt - b.dt)[0];

  // Buscador de usuarios
  const usuariosFiltrados = usuarios.filter(u => {
    const buscar = search.toLowerCase();
    return (
      (!buscar) ||
      (u.name && u.name.toLowerCase().includes(buscar)) ||
      (u.apellido && u.apellido.toLowerCase().includes(buscar)) ||
      (u.fila && u.fila.toString().includes(buscar)) ||
      (u.puesto && u.puesto.toString().includes(buscar)) ||
      (u.pasillo && u.pasillo.toString().includes(buscar))
    );
  });

  // Envío de mensajes (simulado)
  const enviarMensaje = async () => {
    if (!usuarioSeleccionado || !mensaje) return;
    setEnviando(true);
    setTimeout(() => {
      alert(`Mensaje enviado a ${usuarioSeleccionado.name}:\n\n${mensaje}`);
      setEnviando(false);
      setMensaje('');
      setUsuarioSeleccionado(null);
      setSearch('');
    }, 1200);
  };
  const enviarMensajeMasivo = async () => {
    if (!mensajeMasivo) return;
    setEnviandoMasivo(true);
    setTimeout(() => {
      alert(`Mensaje masivo enviado:\n\n${mensajeMasivo}`);
      setEnviandoMasivo(false);
      setMensajeMasivo('');
    }, 1500);
  };

  // --- ESTILOS PRO ---
  const cardWidget = {
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 2px 10px #e4e8f033",
    padding: "26px 30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 170,
    minHeight: 74
  };

  const cardMain = {
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 2px 16px #e4e8f05a",
    padding: "30px 40px",
    flex: "1 1 0",
    minWidth: 260,
    minHeight: 132,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  };

  return (
    <AppLayout>
      <div style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#f5f7fa",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center"
      }}>
        <div style={{
          width: "95vw",
          maxWidth: 1500,
          margin: "38px 0 0",
          display: "grid",
          gridTemplateColumns: "1fr 370px",
          gap: "36px"
        }}>
          {/* ---- GRID PRINCIPAL ---- */}
          <div>
            {/* --- Fila widgets (saludo + hora + clima) --- */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 28,
              marginBottom: 26,
              alignItems: "center"
            }}>
              {/* Saludo */}
              <div style={{ ...cardWidget, color: "#1556a5", fontWeight: 600, fontSize: 22, justifyContent: "center" }}>
                {getSaludo()}
              </div>
              {/* Hora */}
              <div style={{ ...cardWidget, textAlign: "center" }}>
                <div style={{ fontSize: 15, color: "#6b7280", marginBottom: 3 }}>Hora actual</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#1556a5", letterSpacing: 2 }}>
                  {time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div style={{ fontSize: 14, color: "#888" }}>
                  {time.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              {/* Clima */}
              <div style={{ ...cardWidget, justifyContent: "center" }}>
                {weather && weather.main ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                      alt="icono clima"
                      style={{ width: 40, marginBottom: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#1687d9" }}>
                        {Math.round(weather.main.temp)}°C
                      </div>
                      <div style={{ fontSize: 15, color: "#333" }}>
                        {weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}
                      </div>
                      <div style={{ fontSize: 13, color: "#666", marginTop: 1 }}>
                        Bahía Blanca
                      </div>
                    </div>
                  </div>
                ) : (
                  <span style={{ color: "#888", fontSize: 16 }}>Cargando clima...</span>
                )}
              </div>
            </div>
            {/* --- Título dashboard --- */}
            <div style={{
              margin: "18px 0 24px",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 0.5,
              color: "#111",
              textAlign: "left"
            }}>Dashboard Urkupiña</div>
            {/* --- Cards estadísticas --- */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 34
            }}>
              {/* Turnos pendientes */}
              <div style={{ ...cardMain }}>
                <div style={{ fontSize: 19, color: "#3e4861", marginBottom: 14 }}>Turnos pendientes hoy</div>
                <div style={{ fontSize: 54, fontWeight: 700, color: "#f3b103", marginBottom: 7 }}>
                  {pendientesHoy.length}
                </div>
              </div>
              {/* Turnos completados */}
              <div style={{ ...cardMain }}>
                <div style={{ fontSize: 19, color: "#3e4861", marginBottom: 14 }}>Turnos atendidos hoy</div>
                <div style={{ fontSize: 54, fontWeight: 700, color: "#41ba59", marginBottom: 7 }}>
                  {completadosHoy.length}
                </div>
              </div>
              {/* Próximo turno */}
              <div style={{ ...cardMain }}>
                <div style={{ fontSize: 19, color: "#3e4861", marginBottom: 10 }}>Próximo turno</div>
                {proximoTurno ? (
                  <>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#1687d9" }}>
                      {new Date(proximoTurno.dt).toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "2-digit", year: "2-digit" })}
                    </div>
                    <div style={{
                      fontSize: 36,
                      fontWeight: 700,
                      color: "#111"
                    }}>
                      {proximoTurno.hora}
                    </div>
                    <div style={{
                      fontSize: 15, color: "#888", marginTop: 2
                    }}>
                      {proximoTurno.user_name} — {proximoTurno.motivo}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 19, color: "#888", marginTop: 24 }}>
                    Sin turnos pendientes hoy
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* ---- SIDEBAR MENSAJES ---- */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            paddingTop: 5
          }}>
            {/* Mensaje individual */}
            <div style={{
              background: '#fff',
              borderRadius: 14,
              padding: "26px 22px",
              boxShadow: '0 2px 10px #e4e8f055',
              marginBottom: 10
            }}>
              <b style={{ fontSize: 16 }}>Enviar mensaje a usuario</b>
              <div style={{ margin: '18px 0 12px' }}>
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido, fila, puesto, pasillo..."
                  style={{
                    width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd', marginBottom: 8
                  }}
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setUsuarioSeleccionado(null);
                  }}
                />
              </div>
              {/* Resultados búsqueda */}
              {search && (
                <div style={{
                  maxHeight: 140, overflowY: 'auto', marginBottom: 8
                }}>
                  {usuariosFiltrados.slice(0, 6).map(u => (
                    <div key={u.id}
                      onClick={() => setUsuarioSeleccionado(u)}
                      style={{
                        padding: 6,
                        background: usuarioSeleccionado?.id === u.id ? "#bae6fd" : "#f3f4f6",
                        borderRadius: 7,
                        marginBottom: 5,
                        cursor: 'pointer',
                        border: usuarioSeleccionado?.id === u.id ? "1px solid #1990ff" : "1px solid #eee"
                      }}>
                      {u.name} {u.apellido ? u.apellido : ''} {u.fila && `- Fila ${u.fila}`} {u.puesto && `Puesto ${u.puesto}`} {u.pasillo && `Pasillo ${u.pasillo}`}
                    </div>
                  ))}
                  {!usuariosFiltrados.length && <span style={{ color: '#888', fontSize: 13 }}>Sin resultados</span>}
                </div>
              )}
              {/* Input para mensaje */}
              <textarea
                rows={2}
                placeholder={usuarioSeleccionado ? `Mensaje para ${usuarioSeleccionado.name}` : "Selecciona un usuario"}
                style={{
                  width: "100%", borderRadius: 8, border: '1px solid #ddd', marginBottom: 8, padding: 6
                }}
                disabled={!usuarioSeleccionado}
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
              />
              <button
                style={{
                  width: '100%', background: '#1990ff', color: '#fff',
                  border: 'none', padding: '10px 0', borderRadius: 8, fontWeight: 700, marginTop: 2,
                  opacity: (!usuarioSeleccionado || !mensaje || enviando) ? 0.7 : 1,
                  cursor: (!usuarioSeleccionado || !mensaje || enviando) ? "not-allowed" : "pointer"
                }}
                disabled={!usuarioSeleccionado || !mensaje || enviando}
                onClick={enviarMensaje}
              >
                {enviando ? "Enviando..." : "Enviar Mensaje"}
              </button>
            </div>
            {/* Mensaje masivo */}
            <div style={{
              background: '#fff',
              borderRadius: 14,
              padding: "26px 22px",
              boxShadow: '0 2px 10px #e4e8f055'
            }}>
              <b style={{ fontSize: 16 }}>Envío masivo</b>
              <textarea
                rows={3}
                placeholder="Mensaje para todos los usuarios..."
                style={{
                  width: "100%", borderRadius: 8, border: '1px solid #ddd', margin: "14px 0 8px", padding: 6
                }}
                value={mensajeMasivo}
                onChange={e => setMensajeMasivo(e.target.value)}
                disabled={enviandoMasivo}
              />
              <button
                style={{
                  width: '100%', background: '#e6335a', color: '#fff',
                  border: 'none', padding: '10px 0', borderRadius: 8, fontWeight: 700,
                  opacity: (!mensajeMasivo || enviandoMasivo) ? 0.7 : 1,
                  cursor: (!mensajeMasivo || enviandoMasivo) ? "not-allowed" : "pointer"
                }}
                disabled={!mensajeMasivo || enviandoMasivo}
                onClick={enviarMensajeMasivo}
              >
                {enviandoMasivo ? "Enviando..." : "Enviar a todos"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
