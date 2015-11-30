var http = require('http');
var url = require('url');


var options = {
  host: 'http://www.welt.de',
  path: '/?service=Rss'
};

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(str);;
  });
}

http.request(options, callback).end();
