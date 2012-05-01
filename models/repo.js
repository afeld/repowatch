var mongoose = require('mongoose');

var RepoSchema = new mongoose.Schema({
  url: String
});

module.exports = {
  schema: RepoSchema
  // not used as a model directly
};
