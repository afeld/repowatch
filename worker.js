var fs = require('fs'),
  exec = require('child_process').exec,
  mongodb = require('mongodb');


function findMostRecent(repoDir, callback){
  var execOpts = { cwd: repoDir };
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

    user.repos.forEach(function(repo){
      var repoMatch = repo.url.match(/^https:\/\/github.com\/([^\/]+)\/([^\/]+)/),
        repoUser = repoMatch[1],
        repoName = repoMatch[2],
        ghRepo = repoUser + '/' + repoName,
        url = 'git://github.com/' + ghRepo + '.git';

      fs.mkdir('tmp', function(){
        // clone and/or update repo
        exec('cd tmp && git clone ' + url + ' && cd ' + repoName + '.git && git pull', function(){
          findMostRecent('tmp/' + repoName, function(tagOrSha, version){
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


