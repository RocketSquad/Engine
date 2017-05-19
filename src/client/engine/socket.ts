import {IMessage} from '../../common/message';
console.log('connecting to ', location.host, location.port);

let handlerId = 0;
const handlers = {};

let wsRes: any;
let wsReady = new Promise<WebSocket>(res => wsRes = res);
export type IMessage = IMessage;

const makeConnection = () => {
    const ws = new WebSocket(`ws://${location.host}`);
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
        const data: IMessage = JSON.parse(e.data);
        Object.keys(handlers).forEach(key => {
            if(handlers[key][0] === data.topic) {
                handlers[key][1](data);
            }
        });
    });
};

makeConnection();

export const Off = (id: number) => {
    delete handlers[id];
};

export const On = (wildcard: string, msgHandler)  => {
    handlerId++;
    handlers[handlerId] = [wildcard, msgHandler];

    return handlerId;
};

export const Send = (msg) => {
    wsReady.then((ws) => ws.send(JSON.stringify(msg)));
};
