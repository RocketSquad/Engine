"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const ws = require("./ws");
require("./assets");
const http = require('http');
const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
ws.Start(server);
server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});
