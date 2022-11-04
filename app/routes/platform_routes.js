
const express = require('express')
const passport = require('passport')

const User = require('../models/user')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const removeBlanks = require('../../lib/remove_blank_fields')
const user = require('../models/user')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()


// POST -> /platforms
router.post('/platforms', requireToken, removeBlanks, (req, res, next) => {

  const platform = req.body.platform
  const userId = req.user.id

  User.findById(userId)
    .then(handle404)
    .then(user => {
      user.platforms.push(platform)

      return user.save()
    })
    .then(user => {
      res.status(201).json({ user: user })
    })
    .catch(next)
})

// UPDATE a platform
// PATCH -> /platforms/<platform_id>
router.patch('/platforms/:platformId', requireToken, removeBlanks, (req, res, next) => {
  const platformId = req.params.platformId
  const userId = req.user.id

  User.findById(userId)
    .then(handle404)
    .then(user => {
      const theplatform = user.platforms.id(platformId)

      theplatform.set(req.body.platform)
      return user.save()
      
    })
    .then(user => res.status(201).json({ user: user }))
    .catch(next)
})
// DESTROY a platform
// DELETE -> /platforms/<platform_id>
router.delete('/platforms/:platformId', requireToken, (req, res, next) => {
  const platformId = req.params.platformId
  const userId = req.user.id

  User.findById(userId)
    .then(handle404)
    .then(user => {
      const theplatform = user.platforms.id(platformId)

      theplatform.remove()

      return user.save()
    })
    .then(user => res.status(201).json({ user: user }))
    .catch(next)
})


module.exports = router