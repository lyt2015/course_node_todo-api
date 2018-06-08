const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(
  'mongodb://localhost:27017/TodoApp',
  { useMongoClient: true }
);

const Todo = mongoose.model('Todo', {
  text: {
    type: String
  },
  completed: {
    type: Boolean
  },
  completedAt: {
    type: Number
  }
});

/* let todoFishing = new Todo({
  text: 'Go fishing'
}); */

let todoEat = new Todo({
  text: 'Eat lunch',
  completed: true,
  completedAt: 60000
});

todoEat.save().then(
  doc => {
    console.log(`Saved todo: ${doc}`);
  },
  err => {
    console.log('Unable to save todo, ', err);
  }
);
