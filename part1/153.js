var streamContent = function() {
	var fs = require("fs");
	var stream = fs.createReadStream("./resources/resource.json");
	stream.on("data", function(chunk) {
		console.log(chunk);
	});
	stream.on("end", function() {
		console.log("finished");
	});
};
//streamContent();

var streamServer = function() {
	var http = require("http");
	var fs = require("fs");
	var server = http.createServer();
	server.on("request", function(request, result) {
		result.writeHead(200, {"Content-Type" : "image/jpg"});
		fs.createReadStream("./resources/image2.jpg").pipe(result);
	});
	server.listen(8080);
	console.log("Server running at http://localhost:8080/");
};
streamServer();