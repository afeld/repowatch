var express = require('express');

var app = express.createServer();

app.get('/', function(req, res){
    res.send('Hello World');
});

app.listen(3000);
console.log('app started on port 3000');
