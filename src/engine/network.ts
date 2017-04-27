const ws = new WebSocket(`ws://${location.host}/ws`);
const ready = new Promise((res, rej) => {
    ws.addEventListener('open', function (event) {
        res(ws);
    });

    ws.addEventListener('message', msg => {
        const data = JSON.parse(msg.data);

        Object.keys(handlers).forEach(key => {
            handlers[key](data);
        });
    });
});

const handlers = {};

export enum MessageType {
    TREE
}

export interface Message {
    type: MessageType,
    payload: any
}

export default {
    MessageType,
    send(msg: Message) {
        ready.then(() => ws.send(JSON.stringify(msg)));
    },

    removeHandler(name: string) {
        delete handlers[name];
    },

    addHandler(name:string, msgHandler: (msg: Message) => void) {
        handlers[name] = msgHandler;
        return name;
    }
};

