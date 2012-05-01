var mongoose = require('mongoose');

var RepoSchema = new mongoose.Schema({
  url: String
});

mongoose.model('Repo', RepoSchema);
module.exports = RepoSchema;
