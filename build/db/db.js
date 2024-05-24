"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@libsql/client");
const libsql_1 = require("drizzle-orm/libsql");
const client = (0, client_1.createClient)({
    url: process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
});
exports.db = (0, libsql_1.drizzle)(client);
