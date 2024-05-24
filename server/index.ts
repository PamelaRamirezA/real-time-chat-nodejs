import express from 'express'
import logger from 'morgan'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { db } from './db/db'
import { v4 as uuidv4 } from 'uuid';
import { messagesTable } from './db/schema';
import { desc, eq, gt } from 'drizzle-orm'

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
            result = await db
                .insert(messagesTable)
                .values({
                    id: id,
                    content: msg,
                    username: user,
                })
                .execute()
                .then(() => console.log('Message inserted successfully'))
                .catch(error => console.error('Error inserting message:', error));
        } catch (error) {
            console.error(error)
            return
        }
        const [lastInsertedRow] = await db.select().from(messagesTable).orderBy(desc(messagesTable.id_offset)).limit(1).execute();

        io.emit('chat message', msg, lastInsertedRow.id_offset.toString(), user)
    })
    if (!socket.recovered) { //if the user connected is a new one
        try {
            const results = await db.select().from(messagesTable).where(gt(messagesTable.id_offset, socket.handshake.auth.serverOffset ?? 0)).execute();
            console.log(results);
            results.forEach((row: any) => {
                socket.emit('chat message', row.content, row.id, row.username);
            });
        } catch (error) {
            console.error(error);
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
})