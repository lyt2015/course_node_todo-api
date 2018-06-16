const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', done => {
    let text = 'Go river fishing';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.docs.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos:id', () => {
  it('should return a todo doc', done => {
    let id = todos[0]._id.toHexString();

    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.doc.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return a todo doc created by other user', done => {
    let id = todos[1]._id.toHexString();

    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 when todo is not found', done => {
    let id = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 when the ID is invalid', done => {
    request(app)
      .get(`/todos/123`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo with the given ID', done => {
    let id = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.doc._id).toBe(id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(res.body.doc._id)
          .then(doc => {
            expect(doc).toBeFalsy();
            done();
          })
          .catch(err => {
            done(err);
          });
      });
  });

  it('should not remove a todo created by other user', done => {
    let id = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id)
          .then(doc => {
            expect(doc).toBeTruthy();
            done();
          })
          .catch(err => {
            done(err);
          });
      });
  });

  it('should return 404 when todo is not found', done => {
    let id = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 when the ID is invalid', done => {
    request(app)
      .delete(`/todos/123`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo with the given ID', done => {
    let id = todos[0]._id.toHexString();
    let text = 'Go finding some kabutomushi';

    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .type('json')
      .send({ text, completed: true })
      .expect(200)
      .expect(res => {
        expect(res.body.doc.text).toBe(text);
        expect(res.body.doc.completed).toBe(true);
        expect(res.body.doc.completedAt).toEqual(expect.any(Number));
      })
      .end(done);
  });

  it('should not update the todo created by other user', done => {
    let id = todos[0]._id.toHexString();
    let originalText = todos[0].text;
    let text = 'Go finding some kabutomushi';

    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .type('json')
      .send({ text, completed: true })
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then(doc => {
          expect(doc.text).toBe(originalText);
          done();
        });
      });
  });

  it('should clear completedAt when todo is not completed', done => {
    let id = todos[1]._id.toHexString();
    let text = 'Go finding some kabutomushi';

    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({ text, completed: false })
      .expect(200)
      .expect(res => {
        expect(res.body.doc.text).toBe(text);
        expect(res.body.doc.completed).toBe(false);
        expect(res.body.doc.completedAt).toBeFalsy();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should retunr 401 if not authencticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', done => {
    let email = 'abc@example.com';
    let password = '123456';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) {
          return done(err);
        }

        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password);

            done();
          })
          .catch(err => {
            done(err);
          });
      });
  });

  it('should return validation erros if request invalid (400)', done => {
    // let email = 'aaa@example.com';
    let email = 'x@x.x';
    // let password = '123456';
    let password = '123';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use (400)', done => {
    let email = users[0].email;
    let password = '123456';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', done => {
    let [email, password] = [users[1].email, users[1].password];

    request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy();

            expect(user.toObject().tokens[1]).toMatchObject({
              access: 'auth',
              token: res.headers['x-auth']
            });

            // the code below also works
            /*
            expect(user.tokens[1]).toEqual(
              expect.objectContaining({
                access: 'auth',
                token: res.headers['x-auth']
              })
            );
            */

            done();
          })
          .catch(err => {
            done(err);
          });
      });
  });

  it('should reject invalid login', done => {
    let [email, password] = [users[1].email, users[1].password + '123'];

    request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy();
            expect(user.tokens.length).toBe(1);

            done();
          })
          .catch(err => {
            done(err);
          });
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', done => {
    let user = users[0];

    request(app)
      .delete('/users/me/token')
      .set('x-auth', user.tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({ email: user.email })
          .then(doc => {
            expect(doc).toBeTruthy();
            expect(doc.tokens.length).toBe(0);

            done();
          })
          .catch(err => {
            done(err);
          });
      });
  });
});
