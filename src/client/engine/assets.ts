// Load Vox/TOML files from a file
import {Parse, MeshBuilder} from './vox';
import {Send, On, IMessage} from './socket';

const b64 = require('base64-js');
const toml = require('toml');
const ASSETS = {};
const Memoize = (file: string, action: any): Promise<any> => ASSETS[file] ? ASSETS[file] : ASSETS[file] = action(file);

const FromBase64 = (base64: string) => {
    return b64.toByteArray(base64);
};

const postProcess = {
    vox: (data: Response) => data.arrayBuffer().then(arrBuff => Parse(new Uint8Array(arrBuff))),
    toml: (data: Response) => data.text().then(toml.parse)
};

On('asset', (msg: IMessage) => {
    let result = msg.payload;

    if(msg.topic.indexOf('.vox') !== -1) {
        result = FromBase64(msg.payload);
    } else {
        console.log(msg);
    }

    ASSETS[msg.payload.path] = result;e
});

export const When = (file: string, callback: (data: any) => void) => {
    
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
