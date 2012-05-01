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


function findMostRecent(repoDir, callback){
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
}

User.find().each(function(err, user){
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
        findMostRecent('tmp/' + repoName, function(masterSha, version){
          if (version){
            console.log(ghRepo, version);

            mail.message({
              from: 'repowatcher@gmail.com',
              to: [user.email],
              subject: 'New version of ' + repoName + ' - ' + version
            })
            .body("You're welcome!")
            .send(function(err) {
              if (err) throw err;
              console.log('Sent!');
            });

          } else {
            console.log('version not found for ' + ghRepo, masterSha);
          }
        });
      });
    });
  }); 
});
