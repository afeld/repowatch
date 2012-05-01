var mongoose = require('mongoose');


var RepoSchema = new mongoose.Schema({
  url: String
});

var GH_REGEX = /^https:\/\/github.com\/(([^\/]+)\/([^\/]+))(?:\/|$)/;

RepoSchema.methods.getGhRepo = function(){
  return this.url.match(GH_REGEX)[1];
};

RepoSchema.methods.getUser = function(){
  return this.url.match(GH_REGEX)[2];
};

RepoSchema.methods.getName = function(){
  return this.url.match(GH_REGEX)[3];
};

RepoSchema.methods.getCloneUrl = function(){
  return 'git://github.com/' + this.getGhRepo() + '.git';
};


module.exports = {
  schema: RepoSchema
  // not used as a model directly
};
