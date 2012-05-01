var mongoose = require('mongoose');

var dbUrl;

if (process.env.NODE_ENV === 'production'){
  var dbPass = process.env.REPOWATCH_DB_PASS;
  if (!dbPass) throw "REPOWATCH_DB_PASS must be set";
  dbUrl = 'mongodb://admin:' + dbPass + '@ds033107.mongolab.com:33107/repowatch';

} else { // development
  dbUrl = 'mongodb://localhost/repowatch';
}

mongoose.connect(dbUrl);
