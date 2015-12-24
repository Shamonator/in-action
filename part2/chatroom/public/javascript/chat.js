var Chat = function (socket) {
    this.socket = socket;
    this.JOIN_EVENT = "join";
    this.NAME_EVENT = "name";
    this.MESSAGE_EVENT = "message";
};

Chat.prototype.sendMessage = function(room, text) {
    this.socket.emit(this.MESSAGE_EVENT, {
        room: room,
        text: text
    });
};

Chat.prototype.changeRoom = function(room) {
    this.socket.emit(this.JOIN_EVENT, {
        newRoom: room
    });
};

Chat.prototype.changeNickname = function(name) {
    this.socket.emit(this.NAME_EVENT, name);
};

Chat.prototype.processCommand = function(command) {
    var terms = command.split(" ");
    var command = terms[0].substring(1, terms[0].length).toLowerCase();
    var message = "";

    switch (command) {
        case "join":
            terms.shift();
            this.changeRoom(terms.join(" "));
            break;
        case "nick":
            terms.shift();
            this.changeNickname(terms.join(" "));
            break;
        default:
            message = "Unrecognised command.";
            break;
    }

    return message;
};
