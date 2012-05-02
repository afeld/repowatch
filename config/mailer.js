var mailPass = process.env.REPOWATCH_EMAIL_PASS;
if (!mailPass) throw new Error('REPOWATCH_EMAIL_PASS must be set');

module.exports = require('mail').Mail({
  host: 'smtp.gmail.com',
  username: 'repowatcher@gmail.com',
  password: mailPass
});
