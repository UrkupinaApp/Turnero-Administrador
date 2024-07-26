/* const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');
const mysql = require('mysql');
const connectio = require('./db/db.connection');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Permitir todas las conexiones de origen
    methods: ['GET', 'POST']
  }
});

const distPath = path.join(__dirname, 'react', 'Turnos-frontend', 'dist');

// Middleware
app.use(cors({
  origin: '*', // Permitir todas las conexiones de origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permitir estos métodos
  allowedHeaders: ['Content-Type', 'Authorization'] // Permitir estos encabezados
}));
app.use(express.json());

// Rutas API
const AdminRouter = require('./routes/admin.routes');
const UserRoutes = require('./routes/users.routes');
const turnosRouter = require('./routes/turnos.routes');
const creditosRouter = require('./routes/creditos.routes');
const cajasRouter = require('./routes/cajas.routes');

app.use('/api/admin', AdminRouter);
app.use('/api/users', UserRoutes);
app.use('/api/turnos', turnosRouter);
app.use('/api/creditos', creditosRouter);
app.use('/api/cajas', cajasRouter);

// Servir archivos estáticos de React
app.use(express.static(distPath));

// Ruta para manejar todas las otras rutas en la SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Configuración de la base de datos
const db = connectio
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Manejar la conexión de clientes con Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');

  // Enviar turnos disponibles y en curso al cliente
  const sendTurnos = () => {
    db.query('SELECT * FROM turnos WHERE status = "pendiente"', (err, disponibles) => {
      if (err) {
        console.error('Error fetching disponibles turnos:', err);
        return;
      }
      db.query('SELECT * FROM turnos WHERE status = "en_curso"', (err, enCurso) => {
        if (err) {
          console.error('Error fetching en curso turnos:', err);
          return;
        }
        socket.emit('turnos', { disponibles, enCurso });
      });
    });
  };

  sendTurnos();

  // Manejar llamada de turno
  socket.on('llamarTurno', (turnoId) => {
    db.query('UPDATE turnos SET status = "en_curso" WHERE id = ?', [turnoId], (err, result) => {
      if (err) {
        console.error('Error updating turno:', err);
        return;
      }
      sendTurnos();
    });
  });

  // Manejar completado de turno
  socket.on('completarTurno', (turnoId) => {
    db.query('UPDATE turnos SET status = "completado" WHERE id = ?', [turnoId], (err, result) => {
      if (err) {
        console.error('Error updating turno:', err);
        return;
      }
      sendTurnos();
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('API Server running on port', PORT);
});
 */


const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const socketIo = require('socket.io');
const https = require('https'); // Cambiamos http por https
const fs = require('fs'); // Módulo para trabajar con el sistema de archivos
const path = require('path');
const mysql = require('mysql');
const connectio = require('./db/db.connection');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración para HTTPS
const options = {
  key: fs.readFileSync(path.resolve(__dirname, 'server.key')), // Lee el archivo de clave privada
  cert: fs.readFileSync(path.resolve(__dirname, 'server.crt')) // Lee el archivo de certificado
};

const server = https.createServer(options, app); // Crea el servidor HTTPS

const io = socketIo(server, {
  cors: {
    origin: '*', // Permitir todas las conexiones de origen
    methods: ['GET', 'POST']
  }
});

const distPath = path.join(__dirname, 'react', 'Turnos-frontend', 'dist');

// Middleware
app.use(cors({
  origin: '*', // Permitir todas las conexiones de origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permitir estos métodos
  allowedHeaders: ['Content-Type', 'Authorization'] // Permitir estos encabezados
}));
app.use(express.json());

// Rutas API
const AdminRouter = require('./routes/admin.routes');
const UserRoutes = require('./routes/users.routes');
const turnosRouter = require('./routes/turnos.routes');
const creditosRouter = require('./routes/creditos.routes');
const cajasRouter = require('./routes/cajas.routes');

app.use('/api/admin', AdminRouter);
app.use('/api/users', UserRoutes);
app.use('/api/turnos', turnosRouter);
app.use('/api/creditos', creditosRouter);
app.use('/api/cajas', cajasRouter);

// Servir archivos estáticos de React
app.use(express.static(distPath));

// Ruta para manejar todas las otras rutas en la SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Configuración de la base de datos
const db = connectio;
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Manejar la conexión de clientes con Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');

  // Enviar turnos disponibles y en curso al cliente
  const sendTurnos = () => {
    db.query('SELECT * FROM turnos WHERE status = "pendiente"', (err, disponibles) => {
      if (err) {
        console.error('Error fetching disponibles turnos:', err);
        return;
      }
      db.query('SELECT * FROM turnos WHERE status = "en_curso"', (err, enCurso) => {
        if (err) {
          console.error('Error fetching en curso turnos:', err);
          return;
        }
        socket.emit('turnos', { disponibles, enCurso });
      });
    });
  };

  sendTurnos();

  // Manejar llamada de turno
  socket.on('llamarTurno', (turnoId) => {
    db.query('UPDATE turnos SET status = "en_curso" WHERE id = ?', [turnoId], (err, result) => {
      if (err) {
        console.error('Error updating turno:', err);
        return;
      }
      sendTurnos();
    });
  });

  // Manejar completado de turno
  socket.on('completarTurno', (turnoId) => {
    db.query('UPDATE turnos SET status = "completado" WHERE id = ?', [turnoId], (err, result) => {
      if (err) {
        console.error('Error updating turno:', err);
        return;
      }
      sendTurnos();
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('API Server running on HTTPS port', PORT);
});
