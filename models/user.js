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
    async.waterfall([
      function(outerCb){
        // fetch list of watched repos
        request('https://api.github.com/user/watched?access_token=' + self.github.token, outerCb);
      },
      function(res, body, outerCb){
        // clear existing list of watched repos
        self.repo_ids = [];

        // find or create each repo
        var reposData = JSON.parse(body);
        async.forEach(reposData, function(repoData, forEachCb){
          // find/create the repo and update its version number
          var doc = { url: repoData.html_url };
          async.waterfall([
            function(seriesCb){
              Repo.findOne(doc, seriesCb);
            },
            function(repo, seriesCb){
              repo = repo || new Repo(doc);
              self.repo_ids.push(repo._id);
              // will be saved by updateVersion()

              // update the version *before* saving the user, so they don't accidentally
              // get emailed about it immediately
              repo.updateVersion(seriesCb);
            }
          ], forEachCb);

        }, outerCb);
      },
      function(outerCb){
        self.save(outerCb);
      }
    ], callback);
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
