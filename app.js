var http = require('http');
var url = require('url');
var express = require('express');
var xml2js = require('xml2js');
var jsesc = require('jsesc');

if (process.env.VCAP_SERVICES)
{
var services = JSON.parse(process.env.VCAP_SERVICES);

var orchestrateConfig = services["orchestrate"];
if (orchestrateConfig) {
var node = orchestrateConfig[0];
orchestrate_api_key = node.credentials.ORCHESTRATE_API_KEY
orchestrate_api_endpoint = node.credentials.ORCHESTRATE_API_HOST
}
};
var db = require("orchestrate")(orchestrate_api_key,orchestrate_api_endpoint);
function putter(title,link,category,pubDate,description,guid) {
        var jsonTitle=title.toString().replace(/\"/g,'\\"');
        var jsonDesc=description.toString().replace(/\"/g,'\\"');
var jsonString = "{\"title\":\"" +jsonTitle+ "\", \"link\":\""+link+"\", \"category\":\""+category+"\", \"pubDate\":\""+pubDate+"\", \"description\":\""+jsonDesc+"\"}";
var jsonObj = JSON.parse(jsonString);
db.put('nachrichten', guid, jsonObj, false);
};

function fetchNachrichten(){
return http.get({
        host: 'www.welt.de',
        path: '/?service=Rss'
    }, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
         var extractedData = "";
         var parser = new xml2js.Parser();
         parser.parseString(body, function(err,result){
       var parser = new xml2js.Parser();      
      parser.parseString(body.substring(0, body.length), function (err, result) {
      var json = JSON.stringify(result, ["rss", "$", "channel", "item", "title", "link", "category", "pubDate", "description", "guid"]);
      var json1 = JSON.parse(json);
       var bigid="";
   for(var rss in json1) {
     for(var xxx in json1[rss]) {
        for(var yyy in json1[rss][xxx]) {
           for(var zzz in json1[rss][xxx][yyy]) {
                for(var aaa in json1[rss][xxx][yyy][zzz]) {
                       if (aaa!=0){title="";link="";category="";pubDate="";description="";guid="";
                  for(var bbb in json1[rss][xxx][yyy][zzz][aaa]) {
                      if (bbb=="title"){ title=json1[rss][xxx][yyy][zzz][aaa][bbb]; }
                               if (bbb=="link"){  link=json1[rss][xxx][yyy][zzz][aaa][bbb] }
                                 if (bbb=="category"){  category=json1[rss][xxx][yyy][zzz][aaa][bbb] }
                                   if (bbb=="pubDate"){  pubDate=json1[rss][xxx][yyy][zzz][aaa][bbb] }
                                     if (bbb=="description"){ description=json1[rss][xxx][yyy][zzz][aaa][bbb];   }
                                       if (bbb=="guid"){  guid=json1[rss][xxx][yyy][zzz][aaa][bbb] }
 }
  putter(title,link,category,pubDate,description,guid);
                               
                       }
    
                }}}}}
        });
        });
        });
        });
        };

var server = http.createServer(function(req, res) {
res.writeHead(200, {'Content-Type': 'text/plain'});
//fetchNachrichten( function(resp) { res.write(resp);res.end(); }); 
}).listen(process.env.VCAP_APP_PORT);

var minutes = 15, the_interval = minutes * 60 * 1000;
setInterval(function() {
  fetchNachrichten();
  console.log('updateran!')
}, the_interval);


