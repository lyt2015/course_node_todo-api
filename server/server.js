// modify functions to use async await

require('./config/config')

const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')
const { authenticate } = require('./middleware/authenticate')

const port = process.env.PORT
const app = express()

app.use(bodyParser.json())

/*========================================== users ==========================================*/
app.post('/users', async (req, res) => {
  try {
    const user = new User(_.pick(req.body, ['email', 'password']))

    await user.save()
    const token = await user.generateAuthToken()

    res.header('x-auth', token).send(user)
  } catch (err) {
    res.status(400).send(err.errmsg)
  }
})

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = _.pick(req.body, ['email', 'password'])

    const user = await User.findByCredentials(email, password)
    const token = await user.generateAuthToken()

    res.header('x-auth', token).send(user)
  } catch (error) {
    res.status(400).send(error)
  }
})

app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token)

    res.status(200).send()
  } catch (err) {
    res.status(400).send()
  }
})

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

/*========================================== todos ==========================================*/
app.get('/todos', authenticate, async (req, res) => {
  try {
    const docs = await Todo.find({ _creator: req.user._id })

    res.send({ docs })
  } catch (err) {
    res.status(400).send(err.errmsg)
  }
})

app.post('/todos', authenticate, async (req, res) => {
  const todo = new Todo({ text: req.body.text, _creator: req.user._id })

  try {
    const doc = await todo.save()

    res.send(doc)
  } catch (err) {
    res.status(400).send(err.errmsg)
  }
})

app.get('/todos/:id', authenticate, async (req, res) => {
  const id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Invalid ID')
  }

  try {
    const doc = await Todo.findOne({ _id: id, _creator: req.user._id })

    if (!doc) {
      return res.status(404).send('Unable to find this todo')
    }

    res.send({ doc })
  } catch (err) {
    res.status(400).send()
  }
})

app.delete('/todos/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id

    if (!ObjectID.isValid(id)) {
      return res.status(404).send('Invalid ID')
    }

    const doc = await Todo.findOneAndRemove({ _id: id, _creator: req.user._id })

    if (!doc) {
      return res.status(404).send('Unable to find this todo')
    }

    res.send({ doc })
  } catch (err) {
    res.status(400).send(err.errmsg)
  }
})

app.patch('/todos/:id', authenticate, async (req, res) => {
  const id = req.params.id
  const body = _.pick(req.body, ['text', 'completed'])

  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Invalid ID')
  }

  if (_.isBoolean(body.completed)) {
    if (body.completed) {
      body.completedAt = new Date().getTime()
    } else {
      body.completedAt = null
    }
  } else {
    delete body.completed
  }

  try {
    const doc = await Todo.findOneAndUpdate(
      { _id: id, _creator: req.user._id },
      { $set: body },
      { new: true }
    )

    if (!doc) {
      res.status(404).send('Unable to find this todo')
    }

    res.send({ doc })
  } catch (err) {
    res.status(400).send()
  }
})

/* ============================================================================== */
app.listen(port, () => {
  console.log(`Started up at port ${port}`)
})

module.exports = { app }
