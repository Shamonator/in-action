var readJson = function () {
	// make filesystem available
	var fs = require("fs");
	fs.readFile("./resources/resource.json", function (error, data) {
		console.log(data);
	});
};

readJson();