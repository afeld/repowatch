var Repo = require('./models/repo'),
  User = require('./models/user');


// update all repo versions
Repo.find().each(function(err, repo){
  if (!repo) return; // complete

  repo.findLatestVersion(function(err, newVersion){
    var ghRepo = repo.ghRepo,
      oldVersion = repo.version;

    if (newVersion){
      console.log(ghRepo, oldVersion, newVersion);
      if (newVersion !== oldVersion){
        // TODO update stored version number

        // notify users watching this repo of new version
        User.find({ repo_ids: repo._id }).each(function(err, user){
          if (!user) return; // complete

          console.log('notifying user ' + user.github.login + ' about ' + ghRepo + ' ' + newVersion);
          user.notifyNewVersion(repo, newVersion);
        });
      }
    } else {
      console.log('version not found for ' + ghRepo);
    }
  });
});

// TODO exit when all are completed
