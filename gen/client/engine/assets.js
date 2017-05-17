"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Load Vox/TOML files from a file
var vox_1 = require("./vox");
var socket_1 = require("./socket");
var b64 = require('base64-js');
var toml = require('toml');
var ASSETS = {};
var Memoize = function (file, action) { return ASSETS[file] ? ASSETS[file] : ASSETS[file] = action(file); };
var FromBase64 = function (base64) {
    return b64.toByteArray(base64);
};
var postProcess = {
    vox: function (data) { return data.arrayBuffer().then(function (arrBuff) { return vox_1.Parse(new Uint8Array(arrBuff)); }); },
    toml: function (data) { return data.text().then(toml.parse); }
};
socket_1.On('asset', function (msg) {
    var result = msg.payload;
    if (msg.topic.indexOf('.vox') !== -1) {
        result = FromBase64(msg.payload);
    }
    else {
        console.log(msg);
    }
    ASSETS[msg.payload.path] = result;
});
exports.When = function (file, callback) {
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