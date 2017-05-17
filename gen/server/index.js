"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var ws = require("./ws");
require("./assets");
var http = require('http');
var app = express();
app.use(express.static('public'));
var server = http.createServer(app);
ws.Start(server);
server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});
//# sourceMappingURL=index.js.map