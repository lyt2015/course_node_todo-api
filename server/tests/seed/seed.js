const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');

const salt = process.env.JWT_SECRET;

const userOneID = new ObjectID();
const userTwoID = new ObjectID();

const users = [
  {
    _id: userOneID,
    email: 'userOne@example.com',
    password: 'passwordOne',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({ _id: userOneID.toHexString(), access: 'auth' }, salt).toString()
      }
    ]
  },
  {
    _id: userTwoID,
    email: 'userTwo@example.com',
    password: 'passwordTwo',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({ _id: userTwoID.toHexString(), access: 'auth' }, salt).toString()
      }
    ]
  }
];

const populateUsers = done => {
  User.remove({})
    .then(() => {
      let userOne = new User(users[0]).save();
      let userTwo = new User(users[1]).save();

      return Promise.all([userOne, userTwo]);
    })
    .then(() => {
      done();
    });
};

const todos = [
  {
    _id: new ObjectID(),
    text: 'Go fishing on Saturday',
    _creator: userOneID
  },
  {
    _id: new ObjectID(),
    text: 'Go fishing on Sunday',
    completed: true,
    completedAt: 777,
    _creator: userTwoID
  }
];

const populateTodos = done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => {
      done();
    });
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
};
