var fs = require('fs'),
  exec = require('child_process').exec;

function getRepoList(){
  return [
    {
      user: 'afeld',
      name: 'backbone-nested'
    },
    {
      user: 'dcneiner',
      name: 'In-Field-Labels-jQuery-Plugin'
    }
  ];
}

var repos = getRepoList();
repos.forEach(function(repo){
  var ghRepo = repo.user + '/' + repo.name,
    url = 'git://github.com/' + ghRepo + '.git';

  fs.mkdir('tmp', function(){
    // clone and/or update repo
    exec('cd tmp && git clone ' + url + ' && cd ' + repo.name + '.git && git pull', function(){
      var execOpts = { cwd: 'tmp/' + repo.name };
      // get most recent tag
      exec('git describe --abbrev=0 --tags', execOpts, function(error, stdout, stderr){
        var tag = stdout.trim();
        if (tag){
          console.log(ghRepo, tag);  
        } else {
          console.log('tag not found for ' + ghRepo);
        }
      });
    });
  });
});
