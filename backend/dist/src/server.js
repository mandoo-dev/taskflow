"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const cors_1 = require("hono/cors");
const app_1 = __importDefault(require("./app"));
app_1.default.use('*', (0, cors_1.cors)());
const port = Number(process.env.PORT) || 3000;
(0, node_server_1.serve)({ fetch: app_1.default.fetch, port }, (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
});
