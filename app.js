var mongoose = require('mongoose'),
  app = require('./config/environment'),
  User = require('./models/user').model;

app.get('/', function(req, res){
  res.render('index');
});

app.get('/settings', function(req, res){
  res.render('settings');
});


var port = (process.env.NODE_ENV === 'production') ? 80 : 3000;
app.listen(port);
console.log('app started on port ' + port);
