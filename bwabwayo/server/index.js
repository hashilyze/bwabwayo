const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://59.20.195.127:3000', // Next.js 주소
    methods: ['GET', 'POST']
  }
});

// 연결 시
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // 방 입장
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`📥 ${socket.id} joined room ${roomId}`);
  });

  // 메시지 전송
  socket.on('chat-message', ({ roomId, message }) => {
    console.log(`💬 Message from ${socket.id} to room ${roomId}: ${message}`);
    // 같은 방에 있는 다른 유저들에게만 전송
    socket.to(roomId).emit('chat-message', { message, sender: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('🚀 Signaling server running at http://localhost:5000');
});