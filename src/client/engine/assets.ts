// Load Vox/TOML files from a file
import {Parse, MeshBuilder} from './vox';
import {Send, On as SocketOn, IMessage} from './socket';

const b64 = require('base64-js');
const toml = require('toml');
const ASSETS = {};
const Memoize = (file: string, action: any): Promise<any> =>
    ASSETS[file] ? ASSETS[file] : Set(file, action(file));


type WatcherHandler = (payload: any, path?: string) => void;
const Watchers: {[key: string]: WatcherHandler[]} = {};

const FromBase64 = (base64: string) => {
    return b64.toByteArray(base64);
};

const postProcess = {
    vox: (data: Response) => data.arrayBuffer().then(arrBuff => Parse(new Uint8Array(arrBuff))),
    toml: (data: Response) => data.text().then(toml.parse)
};

const Set = (file: string, dataPromise: Promise<any>) => {
    ASSETS[file] = dataPromise;
    const handlers = Watchers[file] || [];

    dataPromise.then((data) => {
        if(handlers) {
            handlers.forEach(fn => fn(data, file));
        }
    });

    return dataPromise;
};

SocketOn('asset', (msg: IMessage) => {
    const result = msg.payload;
    if(result.path.indexOf('.vox') !== -1) {
        result.data = Parse(FromBase64(result.data));
    } else if (result.path.indexOf('.toml') !== -1) {
        result.data = toml.parse(result.data);
    } else {
        console.log('Unhandled asset', msg);
    }

    Set(result.path, Promise.resolve(result.data));
});

export const Off = (file: string, callback: WatcherHandler) => {
    const handlers = Watchers[file] || [];
    const idx = handlers.indexOf(callback);

    if(idx !== -1) {
        Watchers[file] = handlers.splice(idx, 1);
    }

    return idx !== -1;
};

// Need a way to unsub
export const On = (file: string, callback: WatcherHandler) => {
    const handlers = Watchers[file] || [];
    handlers.push(callback);
    Watchers[file] = handlers;
};

export const Get = (file: string) => Memoize(file, () => {
    return fetch(file).then((dataResponse) => {
        let processing = Promise.resolve(dataResponse);

        Object.keys(postProcess).some(key => {
            if(file.indexOf(`.${key}`) !== -1) {
                processing = postProcess[key](dataResponse);
                return true;
            }
        });

        return processing;
    });
});

export const Gets = (files: {[key: string]: string}) => {
    const returnObj: any = {};
    Object.keys(files).forEach(key => {
        returnObj[key] = Get(files[key]);
    });

    returnObj.all = Promise.all(Object.keys(returnObj).map(key => returnObj[key]));
    return returnObj;
};
