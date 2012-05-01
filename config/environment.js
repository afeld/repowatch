var express = require('express'),
  mongoose = require('mongoose');

var app = express.createServer();

app.use(express.logger());
app.use(express.bodyParser());
app.set('view engine', 'ejs');

var dbUrl;

app.configure('development', function(){
  dbUrl = 'mongodb://localhost/repowatch';
});

app.configure('production', function(){
  var dbPass = process.env.REPOWATCH_DB_PASS;
  if (!dbPass) throw "REPOWATCH_DB_PASS must be set";
  dbUrl = 'mongodb://admin:' + dbPass + '@ds033107.mongolab.com:33107/repowatch';
});

mongoose.connect(dbUrl);

module.exports = app;
