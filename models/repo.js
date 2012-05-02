var mongoose = require('mongoose');


var GH_REGEX = /^https:\/\/github.com\/(([^\/]+)\/([^\/]+))\/?$/;

var RepoSchema = new mongoose.Schema({
  url: { type: String, validate: GH_REGEX }
});

RepoSchema.virtual('_urlMatch').get(function(){
  return this.url.match(GH_REGEX);
});

RepoSchema.virtual('ghRepo').get(function(){
  return this._urlMatch[1];
});

RepoSchema.virtual('user').get(function(){
  return this._urlMatch[2];
});

RepoSchema.virtual('name').get(function(){
  return this._urlMatch[3];
});

RepoSchema.virtual('cloneUrl').get(function(){
  return 'git://github.com/' + this.ghRepo + '.git';
});


module.exports = {
  schema: RepoSchema
  // not used as a model directly
};
