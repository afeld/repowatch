require('../config/db');
var vows = require('vows'),
  assert = require('assert'),
  User = require('../models/user').model;


// Create a Test Suite
vows.describe('Repo').addBatch({
  'with a real Github URL': {
    topic: function () {
      var user = new User({
        repos: [
          { url: 'https://github.com/afeld/backbone-nested' }
        ]
      });

      return user.repos[0];
    },

    'should provide a .ghRepo': function(repo){
      assert.equal(repo.ghRepo, 'afeld/backbone-nested');
    },

    'should provide a .user': function(repo){
      assert.equal(repo.user, 'afeld');
    },

    'should provide a .name': function(repo){
      assert.equal(repo.name, 'backbone-nested');
    },

    'should provide a .cloneUrl': function(repo){
      assert.equal(repo.cloneUrl, 'git://github.com/afeld/backbone-nested.git');
    }
  }
}).export(module, {
  // handing errors from mongoose is a pain without this flag... see
  // https://github.com/cloudhead/vows/issues/24
  error: false
});
