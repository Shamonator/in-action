var httpServer = function () {
	var http = require("http");
	http.createServer(function (request, result) {
		result.writeHead(200, {"Content-type": "text/plain"});
		result.end("Hello World\n");
	}).listen(8080);
	console.log("Server running at http://localhost:8080/");
};
httpServer();

var explicitRequestHandler = function () {
	var http = require("http");
	var server = http.createServer();
	server.on("request", function (request, result) {
		result.writeHead(200, {"Content-type" : "text/plain"});
		result.end("Hello World - More Explicit\n");
	});
	server.listen(8081);
	console.log("Explicit handler - Server running at http://localhost:8081");
};
explicitRequestHandler();