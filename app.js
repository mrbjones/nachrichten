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
function putter(title,link,category,pubDate,description,guid,c) {
        var jsonTitle=title.toString().replace(/\"/g,'\\"');
        var jsonLink=link.toString().replace(/\"/g,'\\"');
        var jsonDesc=description.toString().replace(/\"/g,'\\"');
        var jsonCat=category.toString().replace(/\"/g,'\\"');
        var jsonDate=pubDate.toString().replace(/\"/g,'\\"');
        
        
        
var jsonString = "{\"title\":\"" +jsonTitle+ "\", \"link\":\""+jsonLink+"\", \"category\":\""+jsonCat+"\", \"pubDate\":\""+jsonDate+"\", \"description\":\""+jsonDesc+"\", \"source\":\""+c+"\" }";
console.log(jsonString)
var jsonObj = JSON.parse(jsonString);
db.put('nachrichten', guid, jsonObj, false);
};

function fetchNachrichten(a,b,c){
return http.get({
        host: a,
        path: b
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
  //    cb(json)
      var json1 = JSON.parse(json);
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
  putter(title,link,category,pubDate,description,guid,c);
                               
                       }
    
                }}}}}
        });
        });
        });
        });
        };

var server = http.createServer(function(req, res) {
res.writeHead(200, {'Content-Type': 'text/plain'});
res.write('serverUP!');res.end();
// fetchNachrichten( function(resp) { res.write(resp);res.end(); }); 

// fetchNachrichten('www.welt.de', '/?service=Rss', 'die Welt');
// fetchNachrichten('newsfeed.zeit.de', '/index', 'die Zeit');
 fetchNachrichten('www.faz.net', '/rss/aktuell/', 'FAZ');
 fetchNachrichten('www.stern.de', '/feed/standard/all/', 'der Stern');
// fetchNachrichten('www.spiegel.de', '/schlagzeilen/tops/index.rss', 'der Spiegel');
 fetchNachrichten('rss2.focus.de', '/c/32191/f/443312/index.rss', 'Focus');

  console.log('update ran 3!')
  
  
  
}).listen(process.env.VCAP_APP_PORT);

var minutes = 30, the_interval = minutes * 60 * 1000;
setInterval(function() {
        
 fetchNachrichten('www.welt.de', '/?service=Rss', 'die Welt');
 fetchNachrichten('newsfeed.zeit.de', '/index', 'die Zeit');
 fetchNachrichten('www.faz.net', '/rss/aktuell/', 'FAZ');
 fetchNachrichten('www.stern.de', '/feed/standard/all/', 'der Stern');
 fetchNachrichten('www.spiegel.de', '/schlagzeilen/tops/index.rss', 'der Spiegel');
 fetchNachrichten('rss2.focus.de', '/c/32191/f/443312/index.rss', 'Focus');
 
}, the_interval);


