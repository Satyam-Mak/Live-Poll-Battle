// server/src/index.js

const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');
const roomManager = require('./services/roomManager');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // Listen on all network interfaces for deployment

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Add a basic health check route for Render
app.get('/', (req, res) => {
    res.send('Live Poll Battle Server is healthy!');
});

function broadcastRoomState(roomId) {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const payload = {
        ...room,
        users: Array.from(room.users.values()),
    };
    
    const message = JSON.stringify({ type: 'room_update', payload });

    wss.clients.forEach(client => {
        if (client.roomId === roomId && client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

wss.on('connection', (ws) => {
    const userId = uuidv4();
    console.log(`Client ${userId} connected`);

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        
        switch (parsedMessage.type) {
            case 'create_room': {
                const { username } = parsedMessage.payload;
                const newRoom = roomManager.createRoom();
                
                roomManager.joinRoom(newRoom.id, userId, username);
                ws.roomId = newRoom.id;
                
                ws.send(JSON.stringify({ type: 'room_created', payload: newRoom }));
                console.log(`User ${username} (${userId}) created and joined room ${newRoom.id}`);

                broadcastRoomState(newRoom.id);

                const timerId = setInterval(() => {
                    const room = roomManager.getRoom(newRoom.id);
                    if (room && room.timer > 0) {
                        room.timer--;
                        broadcastRoomState(newRoom.id);
                    } else if (room) {
                        room.status = 'closed';
                        broadcastRoomState(newRoom.id);
                        clearInterval(timerId);
                    }
                }, 1000);
                break;
            }
            
            case 'join_room': {
                const { username, roomId } = parsedMessage.payload;
                const joinedRoom = roomManager.joinRoom(roomId, userId, username);

                if (joinedRoom) {
                    ws.roomId = roomId;
                    console.log(`User ${username} (${userId}) joined room ${roomId}`);
                    broadcastRoomState(roomId);
                } else {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Room not found' } }));
                }
                break;
            }

            case 'get_room_state': {
                const { roomId } = parsedMessage.payload;
                ws.roomId = roomId;
                const roomState = roomManager.getRoom(roomId);
                if (roomState) {
                    const payload = {
                        ...roomState,
                        users: Array.from(roomState.users.values()),
                    };
                    ws.send(JSON.stringify({ type: 'room_update', payload }));
                }
                break;
            }

            case 'vote': {
                const { roomId, option } = parsedMessage.payload;
                roomManager.handleVote(roomId, userId, option);
                broadcastRoomState(roomId);
                break;
            }

            default:
                console.log(`Received unknown message type: ${parsedMessage.type} from ${userId}`);
        }
    });

    ws.on('close', () => {
        console.log(`Client ${userId} disconnected`);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Listen on the correct host for deployment
server.listen(PORT, HOST, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});