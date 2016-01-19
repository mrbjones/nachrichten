var http = require('http');
var url = require('url');
var express = require('express');
var fs = require("fs");
var path = require("path");
var mime = require("mime");
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var Cookies = require( "cookies" )

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

function starter() {
      db.put('users', 'xyz', '{"username": "xyz", "hash": "123", "statusr": "inactive"}', true).then(console.log('up!'))
}

function getter(user,cb) {
db.search('nachrichten', '*', {  sort: 'value.pubDate:desc',  limit: 15} )
.then(function (result) {
 //     console.log(JSON.stringify(result))
cb(JSON.stringify(result))
})}

function getLike(user) {
db.search('nachrichten', '*', {sort: 'value.pubDate:desc',  limit: 15} )
.then(function (result) {
      var items = result.body.results;
      sear="("
      items.forEach(function(resser) {
      sear=sear + "@path.destination.key:`"+resser.path.key+"` OR "
      });
      sear=sear.substr(1, sear.length-4)
      sear=sear+")"
      searcher='@path.kind:relationship AND @path.source.key:'+user
      searcher=searcher+' AND ('+sear
db.newSearchBuilder()
.query(searcher)
.then(function (relres) {
      if (relres.body.count > 0){
      var items1 = relres.body.results;
      items1.forEach(function(resser1) {
items.forEach(function(resser) {
      if (resser1.path.destination.key == resser.path.key)
      //resser.value.liker="True"
      {console.log('gotsmeone!')}
});

//      console.log(resser1.path.destination.key)
});
console.log(result)}
if (relres.body.count > 0){console.log(result)}
})
  //    .fail(function (res1) { 
            //console.log(JSON.stringify(res1));
   //   })
})
}

function makeLike(user,key,cb){
db.newGraphBuilder()
.create()
.from('users', user)
.related('marked')
.to('nachrichten', key)
.then(function (result) {
  console.log(result.statusCode);
  cb("liked!")
})
.fail(function (err) {console.log(err);cb('none')})
}

function removeLike(user,key,cb){
db.newGraphBuilder()
.remove()
.from('users', user)
.related('marked')
.to('nachrichten', key)
.then(function (result) {
  console.log(result.statusCode);
  cb("unliked!")
})
.fail(function (err) {console.log(err);cb('none')})
}
/* */
function loggIn(user,passw,cb){
      if (user==='' || user==undefined|| !user){user='dummy'};
     if (user != 'dummy') {
db.get('users', user)    
.then(function (result) {
     if (result.body.password == passw && result.body.statusr == 'active'){
     var hash2 = Math.random();var hasher = (hash2 * 100000000000000000);
db.newPatchBuilder('users', user)
  .replace('hash', hasher)
  .apply()
  .then(cb(hasher))
}
     if (result.body.password != passw){cb(1)}
     if (result.body.statusr != 'active'){cb(2)}
     if (result.body.username==undefined) {cb(3)}
     if (result==undefined) {cb(3)}
}).fail(function (err) {console.log(err);cb('none')})
}}

function checker(user,hash,cb){
     if (user==='' || user==undefined|| !user){user='dummy'};
     if (user != 'dummy') {
db.get('users', user)    
.then(function (result) {
     console.log(result.body.hash +' '+result.body.statusr)
     if (result.body.hash == hash && result.body.statusr == 'active'){console.log('true');cb("true")}
      else {console.log('false');cb('false')}
}
)} else {console.log('false');cb('false')} }

function activateAct(user,hash) {
  db.get('users', user)
  .then(function (result) {
    if (result.body.hash == hash){
   db.newPatchBuilder('users', user)
  .replace('statusr', 'active')
  .apply()
//db.merge('users', user, {  "statusr": "active"  })
}})
.fail(function (err) {console.log(err)})
};

function rpw1(user,cb){
 db.get('users', user )
.then(function (result) {
     console.log(JSON.stringify(result))
     console.log(result.body.username)
    if (result.body.username == user)
    {var hash1 = Math.random();var hasher = (hash1 * 100000000000000000);
 db.newPatchBuilder('users', user)
  .replace('hash', hasher)
  .apply()
  .then(function (result) {
    cb('Please check your email for a password reset link.')
    mailpw(user,hasher);
  })} 
  if (result==undefined||! result) {cb('Email not found.')}
  //   if (!result.body.username || result.body.username == undefined || result.body.username != user ) {cb('Not Found.')}
     console.log(result.body.username)
}).fail(function (err) {console.log(err);cb("Email not found.")})
     
     
}

function rpw2(user,hash,cb){
      db.get('users', user )
.then(function (result) { 
if (result.body.username==user&&result.body.hash==hash)
{cb('true')}
else
{cb('false')}
})}

function rpw3(user,hash,passw1,cb){
      db.get('users', user )
.then(function (result) { 
if (result.body.username==user&&result.body.hash==hash)
{db.newPatchBuilder('users', user)
  .replace('password', passw1)
  .apply()
  .then(function (result) {console.log('pwreset');cb('Password Reset!')})}
else
{cb('Bad Hash.')}
})}

function searcher(a,b,cb) {
db.search('nachrichten', a, {  sort: 'value.pubDate:desc',  limit: 15, offset: b} )
.then(function (result) {
cb(JSON.stringify(result))
})};

function newuser(user,passw,cb) {
     if (user == undefined || passw ==undefined) {cb('Please Choose a Username and a Password.')}
db.get('users', user )
.then(function(response){cb('Username Taken.')})
.fail(function (result) { 
//      console.log(result)
//     console.log(JSON.stringify(result))
//if (result.body.username == undefined){     
var hash1 = Math.random();
var hash = (hash1 * 100000000000000000);
var jsonString = "{\"username\":\"" +user+ "\", \"password\":\""+passw+"\", \"statusr\":\""+"inactive"+"\", \"hash\":\""+hash+"\" }";
var jsonObj = JSON.parse(jsonString);
db.put('users', user, jsonObj, false)
.then(function (result) {
mailer(user,hash);
cb('You will receive an email to activate this account.');
})
      
//}     
//if ((result.body.username != undefined)) {console.log('taken!'); cb('Username already taken.') }          
})
}

function mailer(mail,hash){ 
var transporter = nodemailer.createTransport(smtpTransport({
    host: mailhost,
    port: mailport,
    auth: {
        user: mailalias,
        pass: mailpassword
    }}));
transporter.sendMail({
    from: 'noreply@t3mx.com',
    to: mail,
    subject: 'Please confirm your Zeitung account',
    html: 'Please click the link to confirm your new Zeitung account<br><a href=http://liker.uswest.appfog.ctl.io/?o=act&user='+mail+'&hash='+hash+' >http://loggin.uswest.appfog.ctl.io/?o=act&user='+mail+'&hash='+hash+'</a>'
});
console.log(mail);
}

function mailpw(mail,hash){ 
var transporter = nodemailer.createTransport(smtpTransport({
    host: mailhost,
    port: mailport,
    auth: {
        user: mailalias,
        pass: mailpassword
    }}));
transporter.sendMail({
    from: 'noreply@t3mx.com',
    to: mail,
    subject: 'Please reset your Zeitung password',
    html: 'Please click the link to reset your  Zeitung password<br><a href=http://liker.uswest.appfog.ctl.io/?o=resetpw2&user='+mail+'&hash='+hash+' >http://loggin.uswest.appfog.ctl.io/?o=resetpw2&user='+mail+'&hash='+hash+'</a>'
});
console.log(mail);
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
//start server!
starter();
getLike('mrbrettjones@gmail.com');
var server = http.createServer(function(request, response) {
var queryData = url.parse(request.url, true).query;

//this one just sends the json from ochestrate
if (queryData.o == "g") {
response.writeHead(200, {'Content-Type': 'text/plain;charset=UTF-8'});
getter(queryData.user, function(resp)
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
//this is the first resetpw
if (queryData.o == "resetpw1") {
   rpw1(queryData.user,  function(resp) {
   // response.writeHead(200, {'Content-Type': 'text/plain;charset=UTF-8'});
    response.write(resp);response.end();
   } 
)}
//this is the second resetpw
if (queryData.o == "resetpw2") {
     rpw2(queryData.user, queryData.hash, function(resp) {
     if (resp == 'true'){ 
       var cookies = new Cookies( request, response )
       cookies.set( "email", queryData.user, { httpOnly: false } );
       cookies.set( "hash", queryData.hash, { httpOnly: false } );
      serverWorking(response, './public/resetpw2.html')
     }
  else {serverWorking(response, './public/resetpw1.html')}     
})}
//this is the third resetpw
if (queryData.o == "resetpw3") {
   rpw3(queryData.user,queryData.hash,queryData.passw1,  function(resp) {
    response.writeHead(200, {'Content-Type': 'text/plain;charset=UTF-8'});
    response.write(resp);response.end();
   } 
)}
//this logs in a user
if (queryData.o == "logg") {
// response.writeHead(200, {'Content-Type': 'text/plain;charset=UTF-8'});
loggIn(queryData.user, queryData.passw, function(resp)
{
// console.log(resp)
if (resp != "" && resp !=1 && resp !=2 && resp !=3 && resp!="none"){
var cookies = new Cookies( request, response )
      cookies.set( "email", queryData.user, { httpOnly: false } );
      cookies.set( "hash", resp, { httpOnly: false } );
  response.writeHead(200, {'Content-Type': 'text/plain;charset=UTF-8'});
  response.write("go")
  response.end();
}
  if (resp==1) {response.write("Password Doesn't Match.")
        response.end();
  }
  if (resp==2) {response.write("Login Not Active.")
        response.end();
  }
  if (resp==3) {response.write("Login Not Found")
        response.end();
  }
if (resp == "none") {response.write('Login or Password not found.')
response.end();
}
      
}); }
//this creates a graph

if (queryData.o == "like1")
{
       checker(queryData.user, queryData.hash, function(resp) {
            if (resp == "true"){
            makeLike(queryData.user,queryData.key,  function(resp1) {
            response.write(resp1);response.end();
   })      }
      })}

//this deletes a graph
if (queryData.o=="like2")
{
       checker(queryData.user, queryData.hash, function(resp) {
            if (resp == "true"){
            removeLike(queryData.user,queryData.key,  function(resp1) {
            response.write(resp1);response.end();
   })      }
      })}

//this activates an account
if (queryData.o == "act" ) {
hash1=queryData.hash
user1=queryData.user
activateAct(user1,hash1);
filePath = "public/login.html";
var absPath = filePath;
serverWorking(response, absPath); 
}
//this one sends the page!
if (queryData.o == "" || ! queryData.o ) {
filePath = "";
//if (request.url == '/') {filePath = "public/index.html";}
if (request.url == "/index.html"||request.url == "index.html"||request.url=="/"||request.url==""||request.url=="public/index.html"||!request.url||request.url==undefined) {
          var cookies = new Cookies( request, response )
          var em1='dummy'
          var ha1='123'
          em1=cookies.get("email")
          ha1=cookies.get("hash")
               checker(em1, ha1, function(resp) {
               if (resp == "true"){filePath = "public/index.html";absPath = "./" + filePath;serverWorking(response, absPath)}
               else {filePath = "public/login.html";absPath = "./" + filePath;serverWorking(response, absPath)}
               }
               )}
else {filePath = "public" + request.url;
absPath = "./" + filePath;
console.log(absPath)
serverWorking(response, absPath)
} }
//end server!
}).listen(process.env.VCAP_APP_PORT);

