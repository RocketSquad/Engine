"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('connecting to ', location.toString());
let handlerId = 0;
const handlers = {};
let wsRes;
let wsReady = new Promise(res => wsRes = res);
const makeConnection = () => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.addEventListener('open', () => {
        console.log('connected');
        wsRes(ws);
    });
    ws.addEventListener('close', () => {
        console.log('closed');
        wsReady = new Promise(res => wsRes = res);
        console.log('attempting reconnect...');
        setTimeout(() => {
            makeConnection();
        }, 1000);
    });
    ws.addEventListener('message', (e) => {
        // console.log(e.data);
        const data = JSON.parse(e.data);
        Object.keys(handlers).forEach(key => {
            if (handlers[key][0] === data.topic) {
                handlers[key][1](data);
            }
        });
    });
};
makeConnection();
exports.Off = (id) => {
    delete handlers[id];
};
exports.On = (wildcard, msgHandler) => {
    handlerId++;
    handlers[handlerId] = [wildcard, msgHandler];
    return handlerId;
};
exports.Send = (msg) => {
    wsReady.then((ws) => ws.send(JSON.stringify(msg)));
};
