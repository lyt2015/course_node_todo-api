const { ObjectID } = require('mongodb');

const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');

/* 
Todo.remove().then(result => {
  console.log(result);
});
 */

Todo.findOneAndRemove({ text: 'Fish a fish' }).then(doc => {
  console.log(doc);
});

/* 
Todo.findByIdAndRemove('5b1ce6d3accc2cc0440850ac').then(doc => {
  console.log(doc);
});
 */
