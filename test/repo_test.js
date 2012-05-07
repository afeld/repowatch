var vows = require('vows'),
  assert = require('assert'),
  Repo = require('../models/repo');


var cleanRepos = function(){ Repo.collection.remove(this.callback); };

// Create a Test Suite
vows.describe('Repo').addBatch({
  'with an invalid Github URL': {
    topic: function(){
      return new Repo({
        url: 'gobbldy-gook'
      });
    },

    'when saved': {
      topic: function(repo){ repo.save(this.callback); },
      teardown: cleanRepos,

      'should give a validation error on the repo url': function(err){
        assert.ok(err.errors.url, 'repos should have thrown a validation error');
      }
    }
  },

  'with a real Github URL': {
    topic: function () {
      return new Repo({
        url: 'https://github.com/afeld/backbone-nested'
      });
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
