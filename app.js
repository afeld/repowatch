var express = require('express'),
  mongodb = require('mongodb');

var dbClient;

var app = express.createServer();
app.use(express.logger());
app.use(express.bodyParser());
app.set('view engine', 'ejs');


app.get('/', function(req, res){
  res.render('index', {notice: null});
});

app.post('/submit', function(req, res){
  var usersColl = new mongodb.Collection(dbClient, 'users'),
    userInfo = req.body.user,
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

  usersColl.update({email: email}, doc, {safe: true, upsert: true}, function(err){
    var notice = err || 'Submitted!';
    res.render('index', {notice: notice});
  });
});


dbClient = new mongodb.Db('repowatch', new mongodb.Server('ds033107.mongolab.com', 33107, {}));
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

