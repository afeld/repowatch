var express = require('express');
require('./db.js');

var app = express.createServer();

app.use(express.logger());
app.use(express.bodyParser());
app.set('view engine', 'ejs');

module.exports = app;
