var mongoose = require('mongoose');


var GH_REGEX = /^https:\/\/github.com\/(([^\/]+)\/([^\/]+))\/?$/;

var RepoSchema = new mongoose.Schema({
  url: { type: String, validate: GH_REGEX }
});

RepoSchema.methods = {
  getGhRepo: function(){
      return this.url.match(GH_REGEX)[1];
  },

  getUser: function(){
    return this.url.match(GH_REGEX)[2];
  },

  getName: function(){
    return this.url.match(GH_REGEX)[3];
  },

  getCloneUrl: function(){
    return 'git://github.com/' + this.getGhRepo() + '.git';
  }
};


module.exports = {
  schema: RepoSchema
  // not used as a model directly
};
