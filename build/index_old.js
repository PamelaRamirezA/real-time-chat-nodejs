"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const db_old_1 = __importDefault(require("./db/db_old"));
const uuid_1 = require("uuid");
const port = process.env.PORT || 3500;
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 4,
    },
});
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('A user has connected');
    socket.on('disconnect', () => {
        console.log('A user has disconnected');
    });
    socket.on('chat message', (msg) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        let result;
        if (!msg) {
            throw new Error('El mensaje está vacío');
        }
        const user = (_b = socket.handshake.auth.username) !== null && _b !== void 0 ? _b : 'annonymous';
        const id = (0, uuid_1.v4)();
        try {
            result = yield db_old_1.default.execute({
                sql: 'INSERT INTO messages (id, content, username) VALUES (:id, :content, :username)',
                args: {
                    id: id,
                    content: msg,
                    username: user
                },
            });
        }
        catch (error) {
            console.error(error);
            return;
        }
        io.emit('chat message', msg, result.lastInsertRowid.toString(), user);
    }));
    if (!socket.recovered) { //if the user connected is a new one
        try {
            const results = yield db_old_1.default.execute({
                sql: 'SELECT * FROM messages where id_offset > ?',
                args: [(_a = socket.handshake.auth.serverOffset) !== null && _a !== void 0 ? _a : 0]
            });
            results.rows.forEach((row) => {
                socket.emit('chat message', row.content, row.id, row.username);
            });
        }
        catch (error) {
            console.error(error);
        }
    }
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.get('/', (_req, res) => {
    res.sendFile(process.cwd() + '/client/index.html');
});
server.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server is running on port ${port}`);
    yield db_old_1.default.execute(`CREATE TABLE IF NOT EXISTS messages (
        id TEXT,
        id_offset INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        username TEXT
    )
    `);
}));
