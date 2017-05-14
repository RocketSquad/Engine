// Load Vox/TOML files from a file
import {Parse, MeshBuilder} from './vox';

const toml = require('toml');
const ASSETS = {};
const Memoize = (file: string, action: any): Promise<any> => ASSETS[file] ? ASSETS[file] : ASSETS[file] = action(file);

const postProcess = {
    vox: (data: Response) => data.arrayBuffer().then(arrBuff => Parse(new Uint8Array(arrBuff))),
    toml: (data: Response) => data.text().then(toml.parse)
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
