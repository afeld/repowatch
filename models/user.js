var mongoose = require('mongoose'),
  RepoSchema = require('./repo').schema,
  request = require('request'),
  mailer = require('../config/mailer');


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
  
  repos: [RepoSchema]
});

var User;

UserSchema.methods = {
  updateWatchedRepos: function(callback){
    request('https://api.github.com/user/watched?access_token=' + this.github.token, function(err, res, body){
      var repoData = JSON.parse(body);
      // TODO save to user
      callback();
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

module.exports = {
  schema: UserSchema,
  model: User
};
