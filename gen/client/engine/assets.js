"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Load Vox/TOML files from a file
const vox_1 = require("./vox");
const socket_1 = require("./socket");
const b64 = require('base64-js');
const toml = require('toml');
const ASSETS = {};
const Memoize = (file, action) => ASSETS[file] ? ASSETS[file] : Set(file, action(file));
// oh baby alignment
const InheritanceUp = {};
const InheritanceDown = {};
const Watchers = {};
const FromBase64 = (base64) => {
    return b64.toByteArray(base64);
};
const postProcess = {
    vox: (data, file) => data.arrayBuffer().then(arrBuff => vox_1.Parse(new Uint8Array(arrBuff))),
    toml: (data, file) => data.text()
        .then(toml.parse)
        .then(tomlData => resolveFile(tomlData, file))
};
const resolveFile = async (fileData, file) => {
    if (fileData.is) {
        const chain = InheritanceUp[fileData.is] || [];
        chain.push(file);
        InheritanceUp[fileData.is] = chain;
        InheritanceDown[file] = fileData.is;
        const subData = await exports.Get(fileData.is);
        Object.assign(subData, fileData, {
            has: Object.assign(subData.has, fileData.has)
        });
    }
    else {
        // No longer inherit you fool
        if (InheritanceDown[file]) {
            const downFile = InheritanceDown[file];
            const idx = InheritanceUp[downFile].indexOf(file);
            InheritanceUp[downFile] = InheritanceUp[downFile].splice(idx, 1);
            delete InheritanceDown[file];
        }
    }
    return fileData;
};
const Fire = (file) => exports.Get(file).then(data => {
    const handlers = Watchers[file];
    if (handlers) {
        handlers.forEach(fn => fn(data, file));
    }
    // shit its a gundam.... toml file
    const isToml = file.indexOf('.toml') !== -1;
    const hasUpstream = InheritanceUp[file] && InheritanceUp[file].length > 0;
    if (isToml && hasUpstream) {
        InheritanceUp[file].forEach(Fire);
    }
});
const Set = (file, dataPromise) => {
    ASSETS[file] = dataPromise;
    Fire(file);
    return dataPromise;
};
socket_1.On('asset', (msg) => {
    const result = msg.payload;
    if (result.path.indexOf('.vox') !== -1) {
        result.data = vox_1.Parse(FromBase64(result.data));
    }
    else if (result.path.indexOf('.toml') !== -1) {
        result.data = toml.parse(result.data);
    }
    else {
        console.log('Unhandled asset', msg);
    }
    console.log('SET', result.path);
    Set(result.path, Promise.resolve(result.data));
});
exports.Off = (file, callback) => {
    const handlers = Watchers[file] || [];
    const idx = handlers.indexOf(callback);
    if (idx !== -1) {
        Watchers[file] = handlers.splice(idx, 1);
    }
    return idx !== -1;
};
exports.Watch = async (file, callback) => {
    exports.On(file, callback);
    callback(await exports.Get(file));
};
exports.On = (file, callback) => {
    const handlers = Watchers[file] || [];
    handlers.push(callback);
    Watchers[file] = handlers;
};
exports.Get = (file) => Memoize(file, () => {
    return fetch(file).then((dataResponse) => {
        let processing = Promise.resolve(dataResponse);
        Object.keys(postProcess).some(key => {
            if (file.indexOf(`.${key}`) !== -1) {
                processing = postProcess[key](dataResponse, file);
                return true;
            }
        });
        return processing;
    });
});
exports.Gets = (files) => {
    const returnObj = {};
    Object.keys(files).forEach(key => {
        returnObj[key] = exports.Get(files[key]);
    });
    returnObj.all = Promise.all(Object.keys(returnObj).map(key => returnObj[key]));
    return returnObj;
};
