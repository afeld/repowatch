var mongoose = require('mongoose'),
  Repo = require('./repo');

var UserSchema = new mongoose.Schema({
  email: String,
  repos: [Repo]
});

mongoose.model('User', UserSchema);
module.exports = UserSchema;
