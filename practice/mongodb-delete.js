// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect(
  'mongodb://localhost:27017/TodoApp',
  (err, db) => {
    if (err) {
      return console.log('Unable to connect to MongoDB serer');
    }

    console.log('Connected to MongoDB server');

    // deleteMany
    /* 
    db.collection('Todos')
      .deleteMany({ text: 'Go fishing' })
      .then(result => {
        console.log(result);
      });
    */

    // deleteOne
    /* 
    db.collection('Todos')
      .deleteOne({ text: 'Go fishing' })
      .then(result => {
        console.log(result);
      });
    */

    // findOneAndDelete
    /* 
    db.collection('Todos')
      .findOneAndDelete({ completed: false })
      .then(result => {
        console.log(result);
      });
     */

    /* 
    db.collection('Users')
      .findOneAndDelete({ _id: ObjectID('5b187d95fefc142770fe333e') })
      .then(result => {
        console.log(result);
      }); 
    */

    /* 
    db.collection('Users')
      .deleteMany({ name: 'Zin' })
      .then(result => {
        console.log(JSON.stringify(result, undefined, 2));
      });
    */
   
    // db.close();
  }
);
