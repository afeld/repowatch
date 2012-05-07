var express = require('express'),
  everyauth = require('everyauth'),
  User = require('../models/user');

require('./db.js');


var app = express.createServer(
  express.logger(),
  express.bodyParser(),
  express.cookieParser(),
  express.session({secret: process.env.REPOWATCH_DB_PASS || 'mr ripley'})
);


var ghAppId, ghAppSecret;
app.configure('development', function(){
  ghAppId = 'f0d9b692066a2a6ed109';
  ghAppSecret = '3f1086df07f2121ce9c6c091e6b844ab48a6af53';
});
app.configure('production', function(){
  ghAppId = 'c402a04a828a2844eec9';
  ghAppSecret = process.env.REPOWATCH_GITHUB_SECRET;
  if (!ghAppSecret) throw 'REPOWATCH_GITHUB_SECRET must be set';
});

everyauth.everymodule.findUserById(function(userId, callback){
  User.findById(userId, callback);
  // callback has the signature, function (err, user) {...}
});

everyauth.github
  .appId(ghAppId)
  .appSecret(ghAppSecret)
  .findOrCreateUser(function(session, accessToken, accessTokenExtra, githubUserMetadata){
    var promise = this.Promise();
    User.createOrUpdateFromGh(accessToken, githubUserMetadata, function(err, user){
      if (err) return promise.fail(err);
      promise.fulfill(user);
    });
    return promise;
  })
  .redirectPath('/settings');

app.use(everyauth.middleware());
app.use(app.router);
app.use(express.static(__dirname + '/../public'));

// add everyauth view helpers
everyauth.helpExpress(app);


app.set('view engine', 'ejs');

module.exports = app;
