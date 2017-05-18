"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Load Vox/TOML files from a file
var vox_1 = require("./vox");
var socket_1 = require("./socket");
var b64 = require('base64-js');
var toml = require('toml');
var ASSETS = {};
var Memoize = function (file, action) {
    return ASSETS[file] ? ASSETS[file] : Set(file, action(file));
};
var Watchers = {};
var FromBase64 = function (base64) {
    return b64.toByteArray(base64);
};
var postProcess = {
    vox: function (data) { return data.arrayBuffer().then(function (arrBuff) { return vox_1.Parse(new Uint8Array(arrBuff)); }); },
    toml: function (data) { return data.text().then(toml.parse); }
};
var Set = function (file, dataPromise) {
    ASSETS[file] = dataPromise;
    var handlers = Watchers[file] || [];
    dataPromise.then(function (data) {
        if (handlers) {
            handlers.forEach(function (fn) { return fn(data, file); });
        }
    });
    return dataPromise;
};
socket_1.On('asset', function (msg) {
    var result = msg.payload;
    if (result.path.indexOf('.vox') !== -1) {
        result.data = vox_1.Parse(FromBase64(result.data));
    }
    else if (result.path.indexOf('.toml') !== -1) {
        result.data = toml.parse(result.data);
    }
    else {
        console.log('Unhandled asset', msg);
    }
    Set(result.path, Promise.resolve(result.data));
});
exports.Off = function (file, callback) {
    var handlers = Watchers[file] || [];
    var idx = handlers.indexOf(callback);
    if (idx !== -1) {
        Watchers[file] = handlers.splice(idx, 1);
    }
    return idx !== -1;
};
// Need a way to unsub
exports.On = function (file, callback) {
    var handlers = Watchers[file] || [];
    handlers.push(callback);
    Watchers[file] = handlers;
};
exports.Get = function (file) { return Memoize(file, function () {
    return fetch(file).then(function (dataResponse) {
        var processing = Promise.resolve(dataResponse);
        Object.keys(postProcess).some(function (key) {
            if (file.indexOf("." + key) !== -1) {
                processing = postProcess[key](dataResponse);
                return true;
            }
        });
        return processing;
    });
}); };
exports.Gets = function (files) {
    var returnObj = {};
    Object.keys(files).forEach(function (key) {
        returnObj[key] = exports.Get(files[key]);
    });
    returnObj.all = Promise.all(Object.keys(returnObj).map(function (key) { return returnObj[key]; }));
    return returnObj;
};
//# sourceMappingURL=assets.js.map