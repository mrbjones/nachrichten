var http = require('http');
var url = require('url');


var options = {
  host: 'http://www.welt.de',
  path: '/?service=Rss'
};
function fetchNachrichten(callback){
return http.get({
        host: 'personatestuser.org',
        path: '/email'
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            callback({
              body
            });
        });
    });


}

var server = http.createServer(function(req, res) {
res.writeHead(200, {'Content-Type': 'text/plain'});
fetchNachrichten(callback);
}).listen(process.env.VCAP_APP_PORT);
