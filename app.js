var http = require('http');
var url = require('url');
var express = require('express');
var fs = require("fs");
var path = require("path");
var mime = require("mime");
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

mailalias=process.env.mailalias;
mailpassword=process.env.mailpassword;
mailhost=process.env.mailhost;
mailport=process.env.mailport;

if (process.env.VCAP_SERVICES)
{
var services = JSON.parse(process.env.VCAP_SERVICES);
var orchestrateConfig = services["orchestrate"];
if (orchestrateConfig) {
var node = orchestrateConfig[0];
orchestrate_api_key = node.credentials.ORCHESTRATE_API_KEY
orchestrate_api_endpoint = node.credentials.ORCHESTRATE_API_HOST
}};
var db = require("orchestrate")(orchestrate_api_key,orchestrate_api_endpoint);

function getter(cb) {
db.search('nachrichten', '*', {  sort: 'value.pubDate:desc',  limit: 15} )
.then(function (result) {
cb(JSON.stringify(result))
})};

function activateAct(user,hash) {
db.get('users', user)
.then(function (result) {
    if (result.hash == hash){
    console.log('activate!');
db.merge('users', user, {  "status": "active"  })
}})
.fail(function (err) {console.log(err)})
};

function searcher(a,b,cb) {
db.search('nachrichten', a, {  sort: 'value.pubDate:desc',  limit: 15, offset: b} )
.then(function (result) {
// cb(JSON.stringify(items, ['path', 'key', 'value', 'title', 'description', 'category', 'pubDate', 'link']));
cb(JSON.stringify(result))
})};

function newuser(user,passw,cb) {
var hash1 = Math.random();
var hash = (hash1 * 10000000000000000);
var jsonString = "{\"username\":\"" +user+ "\", \"password\":\""+passw+"\", \"status\":\""+"inactive"+"\", \"hash\":\""+hash+"\" }";
var jsonObj = JSON.parse(jsonString);
db.put('users', user, jsonObj, false)
.then(function (result) {
mailer(user,hash);
cb('You will receive an email to activate this account.')

})};

function mailer(mail,hash){ 
var transporter = nodemailer.createTransport(smtpTransport({
    host: mailhost,
    port: mailport,
    auth: {
        user: mailalias,
        pass: mailpassword
    }
}));

transporter.sendMail({
    from: 'noreplay@t3mx.com',
    to: mail,
    subject: 'Please confirm your Zeitung account',
   html: 'Please click the link to confirm your new Zeitung account<br><ahref=http://loggin.uswest.appfog.ctl.io/?o=act&user='+mail+'&hash='+hash+' >http://loggin.uswest.appfog.ctl.io/?o=act&hash='+hash+'</a>'
});
}


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
var offs=queryData.offs
if (offs==''){offs=0};
searcher(queryData.search+'*', offs, function(resp)
{response.write(resp);response.end();
}); }

//this creates a new user
if (queryData.o == "nu") {
response.writeHead(200, {'Content-Type': 'text/plain;charset=UTF-8'});
newuser(queryData.user, queryData.passw, function(resp)
{response.write(resp);response.end();
}); }

//this activates an account
if (queryData.o == "act" ) {
var hash=queryData.hash
var user=queryData.user
activateAct(user,hash);
filePath = "public/login.html";
var absPath = filePath;
serverWorking(response, absPath); 
}



//this one sends the page!
if (queryData.o == "" || ! queryData.o ) {
var filePath = false;
if (request.url == '/') {
filePath = "public/index.html";
} else {
filePath = "public" + request.url;
}
var absPath = "./" + filePath;
serverWorking(response, absPath); }
}).listen(process.env.VCAP_APP_PORT);

