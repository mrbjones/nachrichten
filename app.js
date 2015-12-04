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

function getter(cb) {
db.list('nachrichten')
.then(function (result) {
var items = result.body.results;
cb(JSON.stringify(items))
})};





var server = http.createServer(function(req, res) {
res.writeHead(200, {'Content-Type': 'text/plain;charset=UTF-8'});

getter( function(resp)
{res.write("<br>" + resp);res.end();
}); 
}).listen(process.env.VCAP_APP_PORT);
