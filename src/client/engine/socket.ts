import {IMessage} from '../../shared/message';
console.log('connecting to ', location.toString());

const ws = new WebSocket('ws://localhost:8080');
let handlerId = 0;
const handlers = {};

let wsRes: any;
const wsReady = new Promise(res => wsRes = res);
export type IMessage = IMessage;

ws.addEventListener('open', () => {
    console.log('connected');
    wsRes();
});

ws.addEventListener('message', (e) => {
    // console.log(e.data);
    const data: IMessage = JSON.parse(e.data);
    Object.keys(handlers).forEach(key => {
        if(handlers[key][0] === data.topic) {
            handlers[key][1](data);
        }
    });
});

export const Off = (id: number) => {
    delete handlers[id];
};

export const On = (wildcard: string, msgHandler)  => {
    handlerId++;
    handlers[handlerId] = [wildcard, msgHandler];

    return handlerId;
};

export const Send = (msg) => {
    wsReady.then(() => ws.send(JSON.stringify(msg)));
};
