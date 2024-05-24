"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesTable = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.messagesTable = (0, sqlite_core_1.sqliteTable)('messages', {
    id: (0, sqlite_core_1.text)('id'),
    id_offset: (0, sqlite_core_1.integer)('id_offset').primaryKey({ autoIncrement: true }),
    content: (0, sqlite_core_1.text)('content'),
    username: (0, sqlite_core_1.text)('username'),
});
