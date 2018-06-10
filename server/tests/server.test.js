const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test to do'
  },
  {
    _id: new ObjectID(),
    text: 'Second test to do'
  }
];

beforeEach(done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => {
      done();
    });
});

describe('POST /todos', () => {
  it('should create a new todo', done => {
    let text = 'Go river fishing';

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text })
          .then(docs => {
            expect(docs.length).toBe(1);
            expect(docs[0].text).toBe(text);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
  });

  it('should not create a todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
          .then(docs => {
            expect(docs.length).toBe(2);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.docs.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos:id', () => {
  it('should return a todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.doc.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 when todo is not found', done => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 when the ID is invalid', done => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });
});
