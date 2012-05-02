var mongoose = require('mongoose'),
  RepoSchema = require('./repo').schema,
  mailer = require('../config/mailer');


var UserSchema = new mongoose.Schema({
  email: String,
  repos: [RepoSchema]
});

UserSchema.methods = {
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


mongoose.model('User', UserSchema);

module.exports = {
  schema: UserSchema,
  model: mongoose.model('User')
};
