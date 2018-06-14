require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const port = process.env.PORT;
const app = express();

app.use(bodyParser.json());

app.post('/users', (req, res) => {
  let user = new User(_.pick(req.body, ['email', 'password']));

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header('x-auth', token).send(user);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

app.post('/users/login', (req, res) => {
  let { email, password } = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(email, password)
    .then(user => {
      user.generateAuthToken().then(token => {
        res.header('x-auth', token).send(user);
      });
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.get('/todos', (req, res) => {
  Todo.find().then(
    docs => {
      res.send({ docs });
    },
    err => {
      res.status(400).send(err);
    }
  );
});

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then(
    doc => {
      res.send(doc);
    },
    err => {
      res.status(400).send(err);
    }
  );
});

app.get('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Invalid ID');
  }

  Todo.findById(id)
    .then(doc => {
      if (!doc) {
        return res.status(404).send('Unable to find this todo');
      }

      res.send({ doc });
    })
    .catch(err => {
      res.status(400).send();
    });
});

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Invalid ID');
  }

  Todo.findByIdAndRemove(id)
    .then(doc => {
      if (!doc) {
        return res.status(404).send('Unable to find this todo');
      }

      res.send({ doc });
    })
    .catch(err => {
      res.status(400).send();
    });
});

app.patch('/todos/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Invalid ID');
  }

  if (_.isBoolean(body.completed)) {
    if (body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completedAt = null;
    }
  } else {
    delete body.completed;
  }

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(doc => {
      if (!doc) {
        return res.status(404).send('Unable to find this todo');
      }

      res.send({ doc });
    })
    .catch(err => {
      res.status(400).send();
    });
});

/* ============================================================================== */
app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = { app };
