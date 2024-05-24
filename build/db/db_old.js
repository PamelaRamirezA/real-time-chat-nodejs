"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@libsql/client");
const db = (0, client_1.createClient)({
    url: process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
});
exports.default = db;
