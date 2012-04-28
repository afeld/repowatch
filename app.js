var express = require('express'),
  mongodb = require('mongodb');

var app = express.createServer();

app.get('/', function(req, res){
  res.send('Hello World');
});


var dbClient = new mongodb.Db('repowatch', new mongodb.Server('ds033107.mongolab.com', 33107, {}));
dbClient.open(function(error){
  if (error){
    console.error(error);
  } else {
    var dbPass = process.env.REPOWATCH_DB_PASS;
    if (!dbPass) throw "REPOWATCH_DB_PASS password not set";
    dbClient.authenticate('admin', dbPass, function(){
      app.listen(3000);
      console.log('app started on port 3000');
    });
  }
});

