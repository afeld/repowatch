var mongoose = require('mongoose');

var dbUrl;

switch (process.env.NODE_ENV){
  case 'production':
    var dbPass = process.env.REPOWATCH_DB_PASS;
    if (!dbPass) throw "REPOWATCH_DB_PASS must be set";
    dbUrl = 'mongodb://admin:' + dbPass + '@ds033107.mongolab.com:33107/repowatch';
    break;
  case 'test':
    dbUrl = 'mongodb://localhost/repowatch_test';
    break;
  default: // development
    dbUrl = 'mongodb://localhost/repowatch_dev';
}

mongoose.connect(dbUrl);
