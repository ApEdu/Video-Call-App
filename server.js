const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => [
    res.render('home')
])

app.get('/room', (req, res) => {
    res.redirect(`/room/${uuidV4()}`)
})

app.get('/room/:room', (req, res) => {
    var name = req.query.name || ''
    res.render('room', { roomId: req.params.room, name: name })
})

// Mailing service
const transporter = require('./src/mailer');


io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId);
        // messages
        socket.on('message', (message, username) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message, username)
        });

        socket.on('invite', (info) => {
            transporter.sendMail(info, (err, res) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(res.response);
            })
        })

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(process.env.PORT || 3030, console.log('Server running'))