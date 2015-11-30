var http = require('http');
var url = require('url');


var options = {
  host: 'http://www.welt.de',
  path: '/?service=Rss'
};
callback = function(response) {
  var str = '';
  response.on('data', function (chunk) {
  str += chunk;
  });
  response.on('end', function () {
  res.write(str);;
  });
}

var server = http.createServer(function(request, response) {
res.writeHead(200, {'Content-Type': 'text/plain'});
http.request(options, callback).end();
}).listen(process.env.VCAP_APP_PORT);
