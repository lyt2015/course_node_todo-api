// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect(
  'mongodb://localhost:27017/TodoApp',
  (err, db) => {
    if (err) {
      return console.log('Unable to connect to MongoDB serer');
    }

    console.log('Connected to MongoDB server');

    /* db.collection('Todos')
      .find({ _id: ObjectID('5b18736a0fe78e2cd49d8d04') })
      .toArray()
      .then(
        docs => {
          console.log('Todos: ');
          console.log(JSON.stringify(docs, undefined, 2));
        },
        err => {
          console.log('Unable to find todos. ', err);
        }
      );
    */

    /* db.collection('Todos')
      .find()
      .count()
      .then(
        count => {
          console.log(`Todos count: ${count}`);
        },
        err => {
          console.log('Unable to find todos. ', err);
        }
      ); */

    db.collection('Users')
      .find({ name: 'Zin' })
      .toArray()
      .then(
        docs => {
          console.log('Users:');
          console.log(JSON.stringify(docs, undefined, 2));
        },
        err => {
          console.log("Unable to find users' records ");
        }
      );

    // db.close();
  }
);
