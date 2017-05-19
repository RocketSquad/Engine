"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
let userIds = 0;
const Users = new Map();
exports.Start = (server) => {
    const wss = new WebSocket.Server({ server });
    wss.on('connection', (ws) => {
        const id = userIds++;
        ws.on('message', (message) => {
            console.log('received: %s', message);
        });
        ws.on('close', () => {
            Users.delete(id);
        });
        const Send = (msg) => {
            ws.send(JSON.stringify(msg));
        };
        Send({
            topic: 'hello',
            payload: []
        });
        Users.set(id, Send);
    });
};
exports.Broadcast = (msg) => {
    Users.forEach(fn => fn(msg));
};
