var socket = io.connect();

$(document).ready(function() {
    var chatApp = new Chat(socket);

    socket.on("nameResult", function(result) {
        var message = "";

        if (result.success)
            message = "You are now known as " + result.name + ".";
        else
            message = result.message;
        $("#room-messages").append(getDivContent(message));
    });

    socket.on("joinResult", function(result) {
        $("#room-name").text(result.room);
        $("#room-messages").append(getDivContent("Room changed."));
    });

    socket.on("messageResult", function(message) {
        console.log("messageResult...." + message.text);
        $("#room-messages").append(getEscapedDivContent(message.text));
    });

    socket.on("roomResult", function(rooms) {
        $("#room-list").empty();

        for (var room in rooms) {
            room = room.substring(1, room.length);
            if (room != "")
                $("#room-list").append(getEscapedDivContent(room));
        }

        $("#room-list div").click(function() {
            chatApp.processCommand("/join " + $(this).text());
            $("#input-message").focus();
        });
    });

    setInterval(function() {
        socket.emit("room");
    }, 1000);

    $("#input-message").focus();

    $("#input-form").submit(function() {
        processUserInput(chatApp, socket);
        return false;
    });
});

function getEscapedDivContent(message) {
    return $("<div></div>").text(message);
}

function getDivContent(message) {
    return $("<div></div>").html("<i>" + message + "</i>");
}

function processUserInput(chatApp, socket) {
    var message = $("#input-message").val();
    var systemMessage = "";

    if (message.charAt(0) == "/") {
        systemMessage = chatApp.processCommand(message);
        if (systemMessage)
            $("#room-messages").append(getDivContent(systemMessage));
    } else {
        chatApp.sendMessage($("#room-name").text(), message);
        var roomMessages = $("#room-messages");
        roomMessages.append(getEscapedDivContent(message));
        roomMessages.scrollTop(roomMessages.prop("scrollHeight"));
    }
    $("#input-message").val("");
}

function timeStamp() {
    var now = new Date();
    var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
    var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
    var suffix = ( time[0] < 12 ) ? "AM" : "PM";

    time[0] = ( time[0] > 12 ) ? time[0] : time[0] - 12;
    // If seconds and minutes are less than 10, add a zero
    for ( var i = 1; i < time.length; i++ )
        if ( time[i] < 10 )
            time[i] = "0" + time[i];

    // Return the formatted string
    return date.join("/") + " " + time.join(":") + " " + suffix;
}
