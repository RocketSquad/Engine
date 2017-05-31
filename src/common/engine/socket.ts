import {IMessage} from 'common/engine/message';

let handlerId = 0;
const handlers = {};

let wsRes: any;
let wsReady = new Promise<WebSocket>(res => wsRes = res);
export type IMessage = IMessage;

const makeConnection = () => {
    const ws = new WebSocket(`ws://${location.host}`);
    ws.addEventListener('open', () => {
        wsRes(ws);
    });

    ws.addEventListener('close', () => {
        wsReady = new Promise(res => wsRes = res);
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

export const Socket = {
    off(id: number) {
        delete handlers[id];
    },

    on(wildcard: string, msgHandler) {
        handlerId++;
        handlers[handlerId] = [wildcard, msgHandler];

        return handlerId;
    },

    send(msg) {
        wsReady.then((ws) => ws.send(JSON.stringify(msg)));
    }
};
