var mongoose = require('mongoose'),
  RepoSchema = require('./repo').schema;

var UserSchema = new mongoose.Schema({
  email: String,
  repos: [RepoSchema]
});

mongoose.model('User', UserSchema);

module.exports = {
  schema: UserSchema,
  model: mongoose.model('User')
};
