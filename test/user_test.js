var vows = require('vows'),
  assert = require('assert'),
  User = require('../models/user').model;

require('../config/db');


// Create a Test Suite
vows.describe('User').addBatch({
  'with a real Github repo': {
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
        assert.equal(err.errors, null);
      }
    }
    
  }
}).export(module);
