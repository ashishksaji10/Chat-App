const express = require('express');
const cors = require('cors');
const app = express()
const authRouter = require('./controllers/authController');
const userRouter = require('./controllers/userController');
const chatRouter = require('./controllers/chatController');
const messageRouter = require('./controllers/messageController');

app.use(cors());

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

const server = require('http').createServer(app);

const io = require('socket.io')(server, {cors: {
    // origin: 'http://localhost:5173',
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
}})


app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);


const onlineUsers = [];

//Test Socket connection form client
io.on('connection', socket => {
    socket.on('join-room', userid => {
        socket.join(userid);
    });

    socket.on('send-message', (message) => {
        io
        .to(message.members[0])
        .to(message.members[1])
        .emit('receive-message', message)

        io
        .to(message.members[0])
        .to(message.members[1])
        .emit('set-message-count', message)
    });

    socket.on('clear-unread-messages', data => {
        io
        .to(data.members[0])
        .to(data.members[1])
        .emit('message-count-cleared', data);
    })

    socket.on('user-typing', data => {
        io
        .to(data.members[0])
        .to(data.members[1])
        .emit('started-typing', data);
    })

    socket.on('user-login', userId => {
        socket.userId = userId; // Store userId on the socket for easy removal on disconnect
        if(!onlineUsers.includes(userId)){
            onlineUsers.push(userId)
        }
        io.emit('online-user-updated', onlineUsers);
    })

    socket.on('user-offline', userId => {
        const index = onlineUsers.indexOf(userId);
        if (index > -1) {
            onlineUsers.splice(index, 1);
        }
        io.emit('online-user-updated', onlineUsers);
    })

    socket.on('disconnect', () => {
        if (socket.userId) {
            const index = onlineUsers.indexOf(socket.userId);
            if (index > -1) {
                onlineUsers.splice(index, 1);
                io.emit('online-user-updated', onlineUsers);
            }
        }
    })
})

module.exports = server;