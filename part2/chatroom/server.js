var send404 = function(response) {
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("Error 404: resource not found.");
    response.end();
};

var sendFile = function(path, mime, response, filePath, fileContents) {
    response.writeHead(200, {"Content-type": mime.lookup(path.basename(filePath))});
    response.end(fileContents);
};

var serveStaticFile = function(fs, path, mime, response, cache, absPath) {
    if (cache[absPath])
        sendFile(path, mime, response, absPath, cache[absPath]);
    else {
        fs.exists(absPath, function(exists) {
            if (exists)
                fs.readFile(absPath, function(error, data) {
                    if (error)
                        send404(response);
                    else {
                        cache[absPath] = data;
                        sendFile(path, mime, response, absPath, data);
                    }
                });
            else
                send404(response);
        });
    }
};

var staticFileServer = function() {
    var http = require("http");
    var fs = require("fs");
    var path = require("path");
    var mime = require("mime");
    var cache = {};

    var server = http.createServer();
    server.on("request", function(request, response) {
        var filePath = "";
        if (request.url == "/")
            filePath = "public/index.html";
        else
            filePath = "public" + request.url;
        var absPath = "./" + filePath;
        console.log("Serving " + absPath);
        serveStaticFile(fs, path, mime, response, cache, absPath);
    });
    server.listen(8081, function() {
        console.log("Server listening on port 8081.");
    });

    var chatServer = require("./lib/chat_server");
    chatServer.listen(server);
};
staticFileServer();
