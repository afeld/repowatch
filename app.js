var mongoose = require('mongoose'),
  app = require('./config/environment');

require('./models/user');
var User = mongoose.model('User');


app.get('/', function(req, res){
  res.render('index', {notice: null});
});

app.post('/submit', function(req, res){
  var userInfo = req.body.user,
    email = userInfo.email;

  console.log(req.body);
  var doc = {
    '$set': {email: email},
    '$addToSet': {
      repos: {
        url: userInfo.repo
      }
    }
  };

  User.update({email: email}, doc, {upsert: true}, function(err, numAffected){
    var notice = err || 'Submitted!';
    res.render('index', {notice: notice});
  });
});


var port = (process.env.NODE_ENV === 'production') ? 80 : 3000;
app.listen(port);
console.log('app started on port ' + port);
