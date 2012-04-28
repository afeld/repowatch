var fs = require('fs'),
  exec = require('child_process').exec,
  mongodb = require('mongodb');

function getRepoList(user){
  var repos = [];
  user.repos.forEach(function(repo){
    var match = repo.url.match(/^https:\/\/github.com\/([^\/]+)\/([^\/]+)/);
    repos.push({
      user: match[1],
      name: match[2]
    });
  });

  return repos;
}

function findMostRecent(repo, callback){
  var execOpts = { cwd: 'tmp/' + repo.name };
  // get most recent tag
  exec('git describe --abbrev=0 --tags', execOpts, function(error, stdout, stderr){
    // console.log(error, stdout, stderr);
    var tag = stdout.trim();
    if (tag){
      callback(tag, tag);
    } else {
      // get most recent commit
      exec('git rev-parse HEAD', execOpts, function(error, stdout, stderr){
        var sha = stdout.trim();
        // TODO find version number
        // grep -i -r 'version\b[^\n]\+(\d+)' *
        callback(sha, undefined);
      });
    }
  });
}

function run(dbClient){
  var usersColl = new mongodb.Collection(dbClient, 'users');
  usersColl.find().each(function(err, user){
    if (!user) return; // sometimes it's null..?
    console.log('user', user);

    var repos = getRepoList(user);
    repos.forEach(function(repo){
      var ghRepo = repo.user + '/' + repo.name,
        url = 'git://github.com/' + ghRepo + '.git';

      fs.mkdir('tmp', function(){
        // clone and/or update repo
        exec('cd tmp && git clone ' + url + ' && cd ' + repo.name + '.git && git pull', function(){
          findMostRecent(repo, function(tagOrSha, version){
            if (version){
              console.log(ghRepo, version);
            } else {
              console.log('version not found for ' + ghRepo, tagOrSha);
            }
            dbClient.close();
          });
        });
      });
    }); 
  });
}

new mongodb.Db('repowatch', new mongodb.Server('ds033107.mongolab.com', 33107, {})).open(function(error, dbClient){
  if (error){
    console.error(error);
  } else {
    var dbPass = process.env.REPOWATCH_DB_PASS;
    if (!dbPass) throw "REPOWATCH_DB_PASS password not set";
    dbClient.authenticate('admin', dbPass, function(){
      run(dbClient);
    });
  }
});


