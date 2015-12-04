var http = require('http');
var url = require('url');
var express = require('express');
var xml2js = require('xml2js');
var jsesc = require('jsesc');
var fs = require("fs");
var path = require("path");
var mime = require("mime");

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

function getter(cb) {
db.search('nachrichten', '*', {  sort: 'value.pubDate:desc',  limit: 100} )
.then(function (result) {
var items = result.body.results;
 cb(JSON.stringify(items, ['path', 'key', 'value', 'title', 'description', 'category', 'pubDate']));

cb(JSON.stringify(items))
})};

function searcher(a,cb) {
db.search('nachrichten', a, {  sort: 'value.pubDate:desc',  limit: 100} )
.then(function (result) {
var items = result.body.results;
 cb(JSON.stringify(items, ['path', 'key', 'value', 'title', 'description', 'category', 'pubDate']));

cb(JSON.stringify(items))
})};


 /*
var server = http.createServer(function(req, res) {
res.writeHead(200, {'Content-Type': 'text/plain;charset=UTF-8'});

getter( function(resp)
{res.write("<br>" + resp);res.end();
}); 
}).listen(process.env.VCAP_APP_PORT);
*/



function send404(response) {
response.writeHead(404, {"Content-type" : "text/plain"});
response.write("Error 404: resource not found");
response.end();
}
function sendPage(response, filePath, fileContents) {
response.writeHead(200, {"Content-type" : mime.lookup(path.basename(filePath))});
response.end(fileContents);
}
function serverWorking(response, absPath) {
fs.exists(absPath, function(exists) {
if (exists) {
fs.readFile(absPath, function(err, data) {
if (err) {
send404(response)
} else {
sendPage(response, absPath, data);
}
});
} else {
send404(response);
}
});
}
var server = http.createServer(function(request, response) {
  var queryData = url.parse(request.url, true).query;
//this one just sends the json from ochestrate
if (queryData.o == "g") {
response.writeHead(200, {'Content-Type': 'text/plain;charset=UTF-8'});
getter( function(resp)
{response.write(resp);response.end();
}); }
//this one does a search!
if (queryData.o == "s") {
response.writeHead(200, {'Content-Type': 'text/plain;charset=UTF-8'});
searcher(queryData.search, function(resp)
{response.write(resp);response.end();
}); }

//this one sends the page!
if (queryData.o != "g" && queryData.o != "s") {
var filePath = false;
if (request.url == '/') {
filePath = "public/index.html";
} else {
filePath = "public" + request.url;
}
var absPath = "./" + filePath;
serverWorking(response, absPath); }
}).listen(process.env.VCAP_APP_PORT);

