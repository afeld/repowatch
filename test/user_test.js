require('../config/db');
var vows = require('vows'),
  assert = require('assert'),
  User = require('../models/user').model;


// Create a Test Suite
vows.describe('User').addBatch({
  'with an invalid Github URL': {
    topic: function () {
      return new User({
        repos: [
          { url: 'gobbldy-gook' }
        ]
      });
    },

    'when saved': {
      topic: function(user){ user.save(this.callback); },

      'should give a validation error on the repo url': function(err){
        assert.ok(err.errors.url, 'repos should have thrown a validation error');
      }
    }
  },

  'with a real Github URL': {
    topic: function () {
      return new User({
        repos: [
          { url: 'https://github.com/afeld/backbone-nested' }
        ]
      });
    },

    'when saved': {
      topic: function(user){ user.save(this.callback); },

      'should not have any errors': function(err){
        assert.ok(!err, 'no error should have been thrown');
      }
    }
  }
}).export(module, {
  // handing errors from mongoose is a pain without this flag... see
  // https://github.com/cloudhead/vows/issues/24
  error: false
});
