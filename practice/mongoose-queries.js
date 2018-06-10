const { ObjectID } = require('mongodb');

const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');

let id = '5b1ac27c3e6dd45300ecf77e';

User.findById(id)
  .then(doc => {
    if (!doc) {
      return console.log('User not found');
    }

    console.log('User: ', JSON.stringify(doc, undefined, 2));
  })
  .catch(err => {
    console.log('Invalid ID');
  });

/*
let id = '5 b1b9ad87017631c70a7289c';

if (!ObjectID.isValid(id)) {
  console.log('ID is not valid');
}

 Todo.find({
  _id: id
})
  .then(docs => {
    console.log('Todos: ', docs);
  })
  .catch(err => {
    console.log(err);
  });

Todo.findOne({
  _id: id
})
  .then(doc => {
    console.log('Todo: ', doc);
  })
  .catch(err => {
    console.log(err);
  }); 

  Todo.findById(id)
  .then(doc => {
    if (!doc) {
      return console.log('ID not found');
    }

    console.log('Todo: ', doc);
  })
  .catch(err => {
    console.log(err);
  });
*/
