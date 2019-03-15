// @format
'use strict';
const readline = require('readline');
const crypto = require('crypto');
const request = require('request');

function sha1sum(string) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(string);
  return sha1.digest('hex').toUpperCase();
}

function findMatch(query, results) {
  for (const result of results) {
    if (result.indexOf(query) != -1) {
      return result;
    }
  }
  return null;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter password to test: ', function(password) {
  const hash = sha1sum(password);
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
      const match = findMatch(rest, results);

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
