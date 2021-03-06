// Load Vox/TOML files from a file
import {Parse} from './vox';
import {Socket, IMessage} from './socket';

const b64 = require('base64-js');
const toml = require('toml');
const ASSETS = {};
const Memoize = (file: string, action: any): Promise<any> =>
    ASSETS[file] ? ASSETS[file] : Set(file, action(file));

type WatcherHandler = (payload: any, path?: string) => void;

// oh baby alignment
const InheritanceUp: {[key: string]: string[]} = {};
const InheritanceDown: {[key: string]: string} = {};

const Watchers: {[key: string]: WatcherHandler[]} = {};

const FromBase64 = (base64: string) => {
    return b64.toByteArray(base64);
};

const postProcess = {
    vox: (data: Response, file: string) => data.arrayBuffer().then(arrBuff => Parse(new Uint8Array(arrBuff))),
    toml: (data: Response, file: string) => data.text()
        .then(toml.parse)
        .then(tomlData => resolveFile(tomlData, file))
};

const resolveFile = async (fileData, file: string) => {
    if(fileData.is) {
        const chain = InheritanceUp[fileData.is] || [];
        chain.push(file);
        InheritanceUp[fileData.is] = chain;
        InheritanceDown[file] = fileData.is;
        const subData = await Get(fileData.is);
        Object.assign(subData, fileData, {
            has: Object.assign(subData.has, fileData.has)
        });
    } else {
        // No longer inherit you fool
        if(InheritanceDown[file]) {
            const downFile = InheritanceDown[file];
            const idx = InheritanceUp[downFile].indexOf(file);
            InheritanceUp[downFile] = InheritanceUp[downFile].splice(idx, 1);
            delete InheritanceDown[file];
        }
    }
    return fileData;
};

const Fire = (file: string) =>
    Get(file).then(data => {
        const handlers = Watchers[file];
        if(handlers) {
            handlers.forEach(fn => fn(data, file));
        }
        // shit its a gundam.... toml file
        const isToml = file.indexOf('.toml') !== -1;
        const hasUpstream = InheritanceUp[file] && InheritanceUp[file].length > 0;
        if(isToml && hasUpstream) {
            InheritanceUp[file].forEach(Fire);
        }
    });

const Set = (file: string, dataPromise: Promise<any>) => {
    ASSETS[file] = dataPromise;
    Fire(file);
    return dataPromise;
};

Socket.on('asset', (msg: IMessage) => {
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

const Off = (file: string, callback: WatcherHandler) => {
    const handlers = Watchers[file] || [];
    const idx = handlers.indexOf(callback);

    if(idx !== -1) {
        Watchers[file] = handlers.splice(idx, 1);
    }

    return idx !== -1;
};

const Watch = async (file: string, callback: WatcherHandler) => {
    On(file, callback);
    Get(file);
};

const On = (file: string, callback: WatcherHandler) => {
    const handlers = Watchers[file] || [];
    handlers.push(callback);
    Watchers[file] = handlers;
};

const Get = (file: string) => Memoize(file, () => {
    return fetch(file).then((dataResponse) => {
        let processing = Promise.resolve(dataResponse);

        Object.keys(postProcess).some(key => {
            if(file.indexOf(`.${key}`) !== -1) {
                processing = postProcess[key](dataResponse, file);
                return true;
            }
        });

        return processing;
    });
});

const Gets = (files: {[key: string]: string}) => {
    const returnObj: any = {};
    Object.keys(files).forEach(key => {
        returnObj[key] = Get(files[key]);
    });

    returnObj.all = Promise.all(Object.keys(returnObj).map(key => returnObj[key]));
    return returnObj;
};

export const Asset = {
    get: Get,
    gets: Gets,
    on: On,
    watch: Watch,
    off: Off
};
