var http = require('http');
var url = require('url');
var xml2js = require('xml2js');

function fetchNachrichten(callback){
return http.get({
        host: 'www.welt.de',
        path: '/?service=Rss'
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
         /*   callback(body); */
         var extractedData = "";
         var parser = new xml2js.Parser();
         parser.parseString(body, function(err,result){
    //Extract the value from the data element
    //     extractedData = result['rss']['channel']['item']['guid'];
    //     extractedData = result.xml.channel.title;
      var parser = new xml2js.Parser();      
      parser.parseString(body.substring(0, body.length), function (err, result) {
      var json = JSON.stringify(result, ["rss", "$", "channel", "item", "title", "link", "category", "pubDate", "description", "guid"]);
         body.forEach(function(obj) { callback(obj.item.guid); });
     
    });
       //  callback(extractedData);
});
        });
    });
};

var server = http.createServer(function(req, res) {
res.writeHead(200, {'Content-Type': 'text/plain'});
fetchNachrichten( function(resp) { res.write(resp);res.end(); }); 
}).listen(process.env.VCAP_APP_PORT);
