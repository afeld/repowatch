require('../config/db');
var mongoose = require('mongoose'),
  Repo = require('./repo'),
  request = require('request'),
  mailer = require('../config/mailer'),
  async = require('async');


var UserSchema = new mongoose.Schema({
  email: String,
  gravatarId: String,
  location: String,
  name: String,
  website: String,

  github: {
    id: Number,
    login: String,
    token: String
  },
  
  repo_ids: [mongoose.Schema.ObjectId]
});

var User;

UserSchema.methods = {
  updateWatchedRepos: function(callback){
    var self = this;
    request('https://api.github.com/user/watched?access_token=' + this.github.token, function(err, res, body){
      // clear existing list of watched repos
      self.repo_ids = [];

      // find or create each repo
      var reposData = JSON.parse(body);
      async.forEach(reposData, function(repoData, forEachCb){
        var doc = { url: repoData.html_url };

        async.waterfall([
          function(seriesCb){
            Repo.findOne(doc, seriesCb);
          },
          function(repo, seriesCb){
            repo = repo || new Repo(doc);
            // will be saved be updateVersion()

            // update the version before adding it to the user
            repo.updateVersion(function(err){
              self.repo_ids.push(repo._id);
              seriesCb(err);
            });
          }
        ], function(err){
          forEachCb(err);
        });

      }, function(err){
        self.save(callback);
      });
    });
  },

  notifyNewVersion: function(repo, version, callback){
    mailer.message({
      from: 'repowatcher@gmail.com',
      to: [this.email],
      subject: 'New version of ' + repo.ghRepo + ' - ' + version
    })
    .body("You're welcome!")
    .send(function(err) {
      if (!err) console.log('Sent!');

      if (callback){
        callback(err);
      } else if (err) {
        throw err;
      }
    });
  }
};

UserSchema.statics = {
  createOrUpdateFromGh: function(token, ghMetadata, callback){
    var update = {
      '$set': {
        email: ghMetadata.email,
        gravatarId: ghMetadata.gravatar_id,
        location: ghMetadata.location,
        name: ghMetadata.name,
        website: ghMetadata.blog,
        github: {
          id: ghMetadata.id,
          login: ghMetadata.login,
          token: token
        }
      }
    };

    this.collection.findAndModify({'github.id': ghMetadata.id}, [], update, {'new': true, upsert: true}, function(err, doc){
      if (err) return callback(err);

      var user = new User(doc);
      callback(null, user);
    });
  }
};


mongoose.model('User', UserSchema);
User = mongoose.model('User');

module.exports = User;
