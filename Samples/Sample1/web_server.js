// var http = require("http");
// var fs = require("fs");

// http.createServer(function (req, res) {
   
//     var index = fs.readFileSync("test.html");
//     res.end(index);
//     res.writeHead(200, {'Content-Type': 'text/html'});
// }).listen(8080);

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
});