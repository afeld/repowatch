require('../config/db');
var vows = require('vows'),
  assert = require('assert'),
  nock = require('nock'),
  ObjectId = require('../node_modules/mongoose/node_modules/mongodb').ObjectID,
  User = require('../models/user');


var SAMPLE_REPO_JSON = {
  "url": "https://api.github.com/repos/octocat/Hello-World",
  "html_url": "https://github.com/octocat/Hello-World",
  "clone_url": "https://github.com/octocat/Hello-World.git",
  "git_url": "git://github.com/octocat/Hello-World.git",
  "ssh_url": "git@github.com:octocat/Hello-World.git",
  "svn_url": "https://svn.github.com/octocat/Hello-World",
  "mirror_url": "git://git.example.com/octocat/Hello-World",
  "id": 1296269,
  "owner": {
    "login": "octocat",
    "id": 1,
    "avatar_url": "https://github.com/images/error/octocat_happy.gif",
    "gravatar_id": "somehexcode",
    "url": "https://api.github.com/users/octocat"
  },
  "name": "Hello-World",
  "description": "This your first repo!",
  "homepage": "https://github.com",
  "language": null,
  "private": false,
  "fork": false,
  "forks": 9,
  "watchers": 80,
  "size": 108,
  "master_branch": "master",
  "open_issues": 0,
  "pushed_at": "2011-01-26T19:06:43Z",
  "created_at": "2011-01-26T19:01:12Z",
  "updated_at": "2011-01-26T19:14:43Z"
};

var cleanUsers = function(){ User.collection.remove(this.callback); };


// Create a Test Suite
vows.describe('User').addBatch({
  'with no repos': {
    topic: function(){ return new User(); },

    '#updateWatchedRepos()': {
      topic: function(user){
        var nockedRequest = nock('https://api.github.com')
          .filteringPath(/access_token=[^&]*/, 'access_token=XXX')
          .get('/user/watched?access_token=XXX')
          .reply(200, [SAMPLE_REPO_JSON]);

        var callback = this.callback;
        user.updateWatchedRepos(function(err){
          callback(err, nockedRequest, user);
        });
      },

      'should have made a request to Github': function(err, nockedRequest){
        nockedRequest.done();
      },

      "should have addded to the user's list of repos": function(err, nockedRequest, user){
        assert.equal(user.repo_ids.length, 1);
      }
    }
  },

  'with an existing repo': {
    topic: function(){
      return new User({
        repo_ids: [new ObjectId()]
      });
    },

    '#updateWatchedRepos()': {
      topic: function(user){
        var nockedRequest = nock('https://api.github.com')
          .filteringPath(/access_token=[^&]*/, 'access_token=XXX')
          .get('/user/watched?access_token=XXX')
          .reply(200, [SAMPLE_REPO_JSON]);

        var callback = this.callback;
        user.updateWatchedRepos(function(err){
          callback(err, nockedRequest, user);
        });
      },

      "should only have one repo ID": function(err, nockedRequest, user){
        assert.equal(err, null);
        assert.equal(user.repo_ids.length, 1);
      }
    }
  },

  '.createOrUpdateFromGh()': {
    topic: function(){ User.createOrUpdateFromGh('abc', {id: 123}, this.callback); },
    teardown: cleanUsers,

    'should return a mongoose doc': function(err, user){
      assert.ok(user instanceof User, 'value passed to callback should be a User instance');
      assert.equal(user.github.id, 123);
      assert.equal(user.github.token, 'abc');
    }
  }
}).export(module, {
  // handing errors from mongoose is a pain without this flag... see
  // https://github.com/cloudhead/vows/issues/24
  error: false
});
