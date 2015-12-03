var http = require('http');
var url = require('url');
var express = require('express');
var xml2js = require('xml2js');
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
function putter(title,link,category,pubDate,description,guid,cb) {
var jsonString = "{\"title\":\"" +title+ "\", \"link\":\""+link+"\", \"category\":\""+category+"\", \"pubDate\":\""+pubDate+"\", \"description\":\""+description+"\"}";
var jsonObj = JSON.parse(jsonString);
db.put('nachrichten', guid, jsonObj, false);
cb("success :!");
};

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
      var json1 = JSON.parse(json);
       var tom="";
   for(var rss in json1) {
     for(var xxx in json1[rss]) {
        for(var yyy in json1[rss][xxx]) {
           for(var zzz in json1[rss][xxx][yyy]) {
                for(var aaa in json1[rss][xxx][yyy][zzz]) {
                       if (aaa!=0){title="";link="";category="";pubDate="";description="";guid="";
                  for(var bbb in json1[rss][xxx][yyy][zzz][aaa]) {
                            //    callback("key:"+rss+xxx+yyy+zzz+aaa+bbb+", value:"+json1[rss][xxx][yyy][zzz][aaa][bbb]);
                          // if (aaa!=0){
                              if (bbb=="title"){  title=json1[rss][xxx][yyy][zzz][aaa][bbb] }
                               if (bbb=="link"){  link=json1[rss][xxx][yyy][zzz][aaa][bbb] }
                                 if (bbb=="category"){  category=json1[rss][xxx][yyy][zzz][aaa][bbb] }
                                   if (bbb=="pubDate"){  pubDate=json1[rss][xxx][yyy][zzz][aaa][bbb] }
                                     if (bbb=="description"){  description=json1[rss][xxx][yyy][zzz][aaa][bbb] }
                                       if (bbb=="guid"){  guid=json1[rss][xxx][yyy][zzz][aaa][bbb] }
                putter(title,link,category,pubDate,description,guid,callback);                       
                                     //     }
                                
 } }
    
                }}}}}
//callback(title +' '+link+' '+category+' '+pubDate+' '+description+' '+guid+'|'+aaa)
     
        });
        });
        });
        });
        };

var server = http.createServer(function(req, res) {
res.writeHead(200, {'Content-Type': 'text/plain'});
fetchNachrichten( function(resp) { res.write(resp);res.end(); }); 
}).listen(process.env.VCAP_APP_PORT);
