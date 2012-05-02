var mongoose = require('mongoose'),
  exec = require('child_process').exec;


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
      var execOpts = { cwd: repoDir };

      // get SHA of master
      exec('git rev-parse HEAD', execOpts, function(error, stdout, stderr){
        var masterSha = stdout.trim();
        // get most recent tag
        exec('git describe --abbrev=0 --tags', execOpts, function(error, stdout, stderr){
          var tag = stdout.trim();
          if (tag){
            callback(masterSha, tag);
          } else {
            // TODO find version number
            // grep -i -r 'version\b[^\n]\+(\d+)' *
            callback(masterSha, undefined);
          }
        });
      });
    });
  }
};


module.exports = {
  schema: RepoSchema
  // not used as a model directly
};
