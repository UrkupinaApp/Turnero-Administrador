const express = require('express');
const router = express.Router();
const { Expo } = require('expo-server-sdk');
const db = require('../db'); // Tu módulo de conexión a la base de datos

// 1. Guardar/actualizar token push
router.post('/register', async (req, res) => {
  const { userId, expoPushToken } = req.body;
  if (!userId || !expoPushToken) return res.status(400).json({ error: 'Faltan datos' });
  // Guarda el token, o actualiza si ya existe
  await db.query('INSERT INTO push_tokens (userId, token) VALUES (?, ?) ON DUPLICATE KEY UPDATE token=?', [userId, expoPushToken, expoPushToken]);
  res.json({ success: true });
});

// 2. Enviar notificación masiva
router.post('/send-mass', async (req, res) => {
  const { title, message, data } = req.body;
  const tokensDb = await db.query('SELECT token FROM push_tokens');
  const tokens = tokensDb.map(row => row.token);
  const expo = new Expo();
  let messages = [];
  for (let pushToken of tokens) {
    if (!Expo.isExpoPushToken(pushToken)) continue;
    messages.push({
      to: pushToken,
      sound: 'default',
      title,
      body: message,
      data: data || {},
    });
  }
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
  res.json({ success: true, totalSent: messages.length });
});

module.exports = router;
