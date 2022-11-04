const express = require('express')
const passport = require('passport')

// pull in Mongoose model for pets
const Game = require('../models/game')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const game = require('../models/game')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// POST -> anybody can give a pet a toy
// POST /toys/<pet_id>
router.post('/reviews/:gameId', requireToken, removeBlanks, (req, res, next) => {
    // get the toy from req.body
    const review = req.body.review
    const gameId = req.params.gameId
    // find the pet by its id
    Game.findById(gameId)
        .then(handle404)
        // add the toy to the pet
        .then(game => {
            // push the toy into the pet's toy array and return the saved pet
            game.reviews.push(review)

            return game.save()
        })
        .then(game => res.status(201).json({ game: game }))
        // pass to the next thing
        .catch(next)
})

// UPDATE a toy
// PATCH -> /toys/<pet_id>/<toy_id>
router.patch('/reviews/:gameId/:reviewId', requireToken, removeBlanks, (req, res, next) => {
    const { gameId, reviewId } = req.params

    // find the pet
    Game.findById(gameId)
        .then(handle404)
        .then(game => {
            // get the specific toy
            const theReview = game.reviews.id(reviewId)

            // make sure the user owns the pet
            requireOwnership(req, game)

            // update that toy with the req body
            theReview.set(req.body.review)

            return game.save()
        })
        .then(game => res.sendStatus(204))
        .catch(next)
})

// DESTROY a toy
// DELETE -> /toys/<pet_id>/<toy_id>
router.delete('/reviews/:gameId/:reviewId', requireToken, (req, res, next) => {
    const { gameId, reviewId } = req.params

    // find the pet
    Game.findById(gameId)
        .then(handle404)
        .then(game => {
            // get the specific toy
            const theReview = game.reviews.id(reviewId)

            // make sure the user owns the pet
            requireOwnership(req, game)

            // update that toy with the req body
            theReview.remove()

            return game.save()
        })
        .then(game => res.sendStatus(204))
        .catch(next)
})

// export router
module.exports = router