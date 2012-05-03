var mongoose = require('mongoose'),
  app = require('./config/environment'),
  User = require('./models/user').model;


app.dynamicHelpers({
  flash: function(req, res){
    return {
      error: req.flash('error') || [],
      info: req.flash('info') || []
    };
  }
});


app.get('/', function(req, res){
  if (req.user) return res.redirect('/settings'); // already signed in
  res.render('index');
});

app.get('/settings', function(req, res){
  var user = req.user;
  if (!user) return res.redirect('/'); // needs to be signed in
  res.render('settings', { user: user });
});

app.post('/unsubscribe', function(req, res){
  var user = req.user;
  if (!user) return res.redirect('/'); // needs to be signed in
  user.remove(function(err){
    if (err){
      req.flash('error', err);
    } else {
      req.flash('info', 'You have been removed from the system');
    }
    
    res.redirect('/logout');
  });
});


var port = (process.env.NODE_ENV === 'production') ? 80 : 3000;
app.listen(port);
console.log('app started on port ' + port);
