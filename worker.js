var fs = require('fs'),
  exec = require('child_process').exec;

require('./config/db');
var User = require('./models/user').model;

var mailPass = process.env.REPOWATCH_EMAIL_PASS;
if (!mailPass) throw new Error('REPOWATCH_EMAIL_PASS must be set');
var mail = require('mail').Mail({
  host: 'smtp.gmail.com',
  username: 'repowatcher@gmail.com',
  password: mailPass
});


// clone and/or update repo
function cloneRepo(repo, callback){
  var repoName = repo.getName(),
    clonePath = 'tmp/' + repo.getUser();

  exec('mkdir -p ' + clonePath + ' && cd ' + clonePath + ' && git clone ' + repo.getCloneUrl() + ' && cd ' + repoName + ' && git pull', function(){
    callback(clonePath + '/' + repoName);
  });
}

function findMostRecent(repo, callback){
  cloneRepo(repo, function(repoDir){
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

function notifyNewVersion(user, repo, version){
  mail.message({
    from: 'repowatcher@gmail.com',
    to: [user.email],
    subject: 'New version of ' + repo.getGhRepo() + ' - ' + version
  })
  .body("You're welcome!")
  .send(function(err) {
    if (err) throw err;
    console.log('Sent!');
  });
}


User.find().each(function(err, user){
  if (!user) return; // sometimes it's null..?
  console.log('user', user);

  user.repos.forEach(function(repo){
    findMostRecent(repo, function(masterSha, version){
      var ghRepo = repo.getGhRepo();
      if (version){
        console.log(ghRepo, version);
        notifyNewVersion(user, repo, version);
      } else {
        console.log('version not found for ' + ghRepo, masterSha);
      }
    });
  });
});
