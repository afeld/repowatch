require('../config/db');
var mongoose = require('mongoose'),
  exec = require('child_process').exec;


var GH_REGEX = /^https:\/\/github.com\/(([^\/]+)\/([^\/]+))\/?$/;

var RepoSchema = new mongoose.Schema({
  url: { type: String, validate: GH_REGEX },
  version: String
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

RepoSchema.methods = {
  // clone and/or update repo
  clone: function(callback){
    var repoName = this.name,
      clonePath = 'tmp/' + this.user;

    exec('mkdir -p ' + clonePath + ' && cd ' + clonePath + ' && git clone ' + this.cloneUrl + ' && cd ' + repoName + ' && git pull', function(){
      callback(clonePath + '/' + repoName);
    });
  },

  findLatestVersion: function(callback){
    this.clone(function(repoDir){
      // get most recent tag
      exec('git describe --abbrev=0 --tags', { cwd: repoDir }, function(error, stdout, stderr){
        var tag = stdout.trim();
        if (tag){
          callback(null, tag);
        } else {
          // TODO find version number
          // grep -i -r 'version\b[^\n]\+(\d+)' *
          callback('no version found', undefined);
        }
      });
    });
  },

  // saves the repo
  updateVersion: function(callback){
    var self = this;
    this.findLatestVersion(function(err, version){
      self.version = version;
      self.save(function(err){
        callback(err);
      });
    });
  }
};


mongoose.model('Repo', RepoSchema);

module.exports = mongoose.model('Repo');
