const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');

let data = {
  id: 777
};

const salt = 'There is a ton of salt.';

let token = jwt.sign(data, salt);
console.log(typeof token);
console.log(token);

let decoded = jwt.verify(token, salt);
console.log('Decoded: ', decoded);

/* 
let message = 'This is a secret message';
// let hash = SHA256(message).toString();
let hash = SHA256(message);

console.log(`Message: ${message}`);
console.log(`Hash: ${hash}`);
console.log(`Type of hash: ${typeof hash}`);

let data = {
  id: 777
};

const salt = 'this can enhance security';
let token = {
  data,
  hash: SHA256(JSON.stringify(data) + salt).toString()
};

// If someone try to pretend to be another user
token.data.id = 666;
token.hash = SHA256(JSON.stringify(token.data)).toString();

let hashResult = SHA256(JSON.stringify(token.data) + salt).toString();

if (hashResult === token.hash) {
  console.log('Data was not changed');
} else {
  console.log('Data was changed. Do not trust.');
}
 */
