var mongoose = require('mongoose'),
  app = require('./config/environment'),
  User = require('./models/user').model;


app.get('/', function(req, res){
  if (req.user) return res.redirect('/settings'); // already signed in
  res.render('index');
});

app.get('/settings', function(req, res){
  var user = req.user;
  if (!user) return res.redirect('/'); // needs to be signed in
  res.render('settings', { user: user });
});


var port = (process.env.NODE_ENV === 'production') ? 80 : 3000;
app.listen(port);
console.log('app started on port ' + port);
