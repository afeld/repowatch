require('./config/db');
var User = require('./models/user');


User.find().each(function(err, user){
  if (!user) return; // sometimes it's null..?
  console.log('user', user);

  user.repos.forEach(function(repo){
    repo.findLatestVersion(function(masterSha, version){
      var ghRepo = repo.ghRepo;
      if (version){
        console.log(ghRepo, version);
        user.notifyNewVersion(repo, version);
      } else {
        console.log('version not found for ' + ghRepo, masterSha);
      }
    });
  });
});
