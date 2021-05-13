const User = require('../models/user')

let checkDuplicateEmail = (req, res, next) => {
  
      // Email
      User.findOne({
        email: req.body.email,
      }).exec((err, user) => {
        if (err) {
          res.status(500).send({ message: err })
          return
        }
  
        if (user) {
          res.status(500).send({ message: 'failed, email already exists' })
          return
        }
  
        next()
      })

  }

  const verifySignUp = { checkDuplicateEmail }

module.exports = verifySignUp