const express = require('express');
const app = express();
const socketio = require('socket.io');

let namespaces = require('./data/namespaces');

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);
const io = socketio(expressServer);

// io.on = io.of('/').on
io.on('connection', (socket) => {
    // console.log(socket.handshake);

    let nsData = namespaces.map((ns) => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    });

    socket.emit('nsList', nsData);
});

namespaces.forEach((namespace) => {
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        // console.log(`${nsSocket.id} has join ${namespace.endpoint}`);
        const username = nsSocket.handshake.query.username;

        nsSocket.emit('nsRoomLoad', namespace.rooms);

        nsSocket.on('joinRoom', (roomToJoin, numberOfUsersCallback) => {
            const roomToLeave = Object.keys(nsSocket.rooms)[1];
            nsSocket.leave(roomToLeave);
            updateUsersInRoom(namespace, roomToLeave);
            nsSocket.join(roomToJoin);

            // io.of('/wiki').in(roomToJoin).clients((error, clients) => {
            //     // console.log(clients);
            //     numberOfUsersCallback(clients.length);
            // });

            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomToJoin;
            });

            nsSocket.emit('historyCatchUp', nsRoom.history);

            updateUsersInRoom(namespace, roomToJoin);
        });

        nsSocket.on('newMessageToServer', (msg) => {
            // console.log(nsSocket.rooms);
            const fullMsg = {
                text: msg.text,
                time: Date.now(),
                username: username,
                avatar: 'http://via.placeholder.com/30'
            };

            const roomTitle = Object.keys(nsSocket.rooms)[1];

            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomTitle;
            });

            nsRoom.addMessage(fullMsg);

            io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg);
        });
    });
});

function updateUsersInRoom(namespace, roomToJoin) {
    io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
        io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers', clients.length);
    });
}