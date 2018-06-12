const { User } = require('../models/user');

const authenticate = (req, res, next) => {
  let token = req.header('x-auth');

  User.findByToken(token)
    .then(doc => {
      if (!doc) {
        return Promise.reject();
      }

      req.doc = doc;
      req.token = token;
      next();
    })
    .catch(err => {
      res.status(401).send();
    });
};

module.exports = {
  authenticate
};
