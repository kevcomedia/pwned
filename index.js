// @format
'use strict';
const readline = require('readline');
const crypto = require('crypto');
const request = require('request');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter password to test: ', function(password) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(password);
  const hash = sha1.digest('hex').toUpperCase();
  const prefix = hash.slice(0, 5);
  const rest = hash.slice(5);

  request(`https://api.pwnedpasswords.com/range/${prefix}`, function(
    err,
    res,
    body,
  ) {
    if (err) {
      return console.error(err);
    }
    if (res.statusCode == 200) {
      const results = body.split('\r\n');
      let match;
      for (const result of results) {
        if (result.indexOf(rest) == -1) continue;

        match = result;
        break;
      }

      if (!match) {
        return console.log('This password has not yet been pwned (probably)');
      }
      const [_, count] = match.split(':');
      console.log(
        `This password has been pwned ${count} ${
          count == 1 ? 'time' : 'times'
        }`,
      );
    }
  });

  rl.close();
});
