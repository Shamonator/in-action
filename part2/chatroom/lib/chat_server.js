var socketIO = require("socket.io");
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

var ROOM_EVENT = "room";
var NAME_EVENT = "name";
var JOIN_EVENT = "join";
var MESSAGE_EVENT = "message";
var CONNECTION_EVENT = "connection";
var DICONNECT_EVENT = "disconnect";

var ROOM_RESULT = "roomResult";
var NAME_RESULT = "nameResult";
var JOIN_RESULT = "joinResult";
var MESSAGE_RESULT = "messageResult";

exports.listen = function(server) {
    io = socketIO.listen(server);
    io.set("log level", 1);
    io.sockets.on(CONNECTION_EVENT, function(socket) {
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        joinRoom(socket, "Lobby");
        messageBroadcastHandler(socket, nickNames);
        nameChangeHandler(socket, nickNames, namesUsed);
        joinRoomHandler(socket, currentRoom);
        socket.on(ROOM_EVENT, function() {
            socket.emit(ROOM_RESULT, io.sockets.manager.rooms);
        });
        clientDisconnectHandler(socket, namesUsed, nickNames);
    });
};

var assignGuestName = function(socket, guestNumber, nickNames, namesUsed) {
    var name = "Guest" + guestNumber;
    nickNames[socket.id] = name;
    socket.emit(NAME_RESULT, {success: true, name: name});
    namesUsed.push(name);
    return ++guestNumber;
};

var joinRoom = function(socket, room) {
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit(JOIN_RESULT, {success: true, room: room});
    socket.broadcast.to(room).emit(MESSAGE_RESULT, {
        text: nickNames[socket.id] + " has joined " + room + "."
    });
    var usersInRoom = io.sockets.clients(room);
    if (usersInRoom.length > 1) {
        var usersInRoomSummary = "Users currently in " + room + ": ";
        for (var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            if (userSocketId != socket.id) {
                if (index > 0)
                    usersInRoomSummary += ", ";
                usersInRoomSummary += nickNames[userSocketId];
            }
        }
        usersInRoomSummary += "."
        socket.emit(MESSAGE_RESULT, {text: usersInRoomSummary});
    }
};

var messageBroadcastHandler = function(socket, nickNames) {
    socket.on(MESSAGE_EVENT, function(message) {
        socket.broadcast.to(message.room).emit(MESSAGE_RESULT, {
            text: nickNames[socket.id] + ": " + message.text
        });
    });
};

var nameChangeHandler = function(socket, nickNames, namesUsed) {
    socket.on(NAME_EVENT, function(name) {
        if (name.indexOf("Guest") == 0)
            socket.emit(NAME_RESULT, {
                success: false,
                message: "Names cannot begin with 'Guest'."
            });
        else {
            if (namesUsed.indexOf(name) == -1) {
                var previousName = nickNames[socket.id];
                namesUsed.splice(namesUsed.indexOf(nickNames[socket.id]), 1);
                namesUsed.push(name);
                nickNames[socket.id] = name;
                socket.emit(NAME_RESULT, {
                    success: true,
                    name: name
                });
                socket.broadcast.to(currentRoom[socket.id]).emit(MESSAGE_RESULT, {
                    text: previousName + " is now known as " + name + "."
                });
            } else
                socket.emit(NAME_RESULT, {
                    success: false,
                    message: "That name is already in use."
                });
        }
    });
};

var joinRoomHandler = function(socket, currentRoom) {
    socket.on(JOIN_EVENT, function(room) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom);
    });
};

var clientDisconnectHandler = function(socket, namesUsed, nickNames) {
    socket.on(DICONNECT_EVENT, function() {
        namesUsed.splice(namesUsed.indexOf(nickNames[socket.id]), 1);
        delete nickNames[socket.id];
    });
};
