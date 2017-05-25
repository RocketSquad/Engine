import * as WebSocket from 'ws';
import {Server} from 'http';
import {IMessage} from 'common/engine/message';

let userIds = 0;
const Users = new Map();

export const Start = (server: Server) => {
    const wss = new WebSocket.Server({ server });
    wss.on('connection', (ws) => {
        const id = userIds++;
        ws.on('message', (message) => {
            console.log('received: %s', message);
        });

        ws.on('close', () => {
            Users.delete(id);
        });

        const Send = (msg: IMessage) => {
            ws.send(JSON.stringify(msg));
        };

        Send({
            topic: 'hello',
            payload: []
        });

        Users.set(id, Send);
    });
};

export const Broadcast = (msg: IMessage) => {
    Users.forEach(fn => fn(msg));
};

