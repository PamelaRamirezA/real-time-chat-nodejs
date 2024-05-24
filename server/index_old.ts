import express from 'express'
import logger from 'morgan'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import db from './db/db_old'
import { v4 as uuidv4 } from 'uuid';

const port = process.env.PORT || 3500
const app = express()
const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 4,
    },
})


io.on('connection', async (socket) => {
    console.log('A user has connected')
    socket.on('disconnect', () => {
        console.log('A user has disconnected')
    })
    socket.on('chat message', async (msg) => {
        let result: any;
        if (!msg) {
            throw new Error('El mensaje está vacío');
        }
        const user = socket.handshake.auth.username ?? 'annonymous';
        const id = uuidv4();
        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (id, content, username) VALUES (:id, :content, :username)',
                args: {
                    id: id,
                    content: msg,
                    username: user
                },
            });
        } catch (error) {
            console.error(error)
            return
        }
        io.emit('chat message', msg, result.lastInsertRowid.toString(), user)
    })

    if (!socket.recovered) { //if the user connected is a new one
        try {
            const results = await db.execute({
                sql: 'SELECT * FROM messages where id_offset > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            })
            results.rows.forEach((row: any) => {
                socket.emit('chat message', row.content, row.id, row.username)
            })
        } catch (error) {
            console.error(error)
        }
    }
})

app.use(express.json())
app.use(logger('dev'))

app.get('/', (_req, res) => {
    res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, async () => {
    console.log(`Server is running on port ${port}`)
    await db.execute(`CREATE TABLE IF NOT EXISTS messages (
        id TEXT,
        id_offset INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        username TEXT
    )
    `)
})