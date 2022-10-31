// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for games
const Game = require('../models/game')

// User model Import
const User = require('../models/user')

// import GiantBomb Api Key
const apiKey = require('../APIKey')

// import Axios
const axios = require('axios')

// import script for adding game to db
const findAndAddGame = require('../scripts/scripts')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { game: { title: '', text: 'foo' } } -> { game: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /games
router.get('/games', requireToken, (req, res, next) => {
	Game.find()
		.then((games) => {
			// `games` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return games.map((game) => game.toObject())
		})
		// respond with status 200 and JSON of the games
		.then((games) => res.status(200).json({ games: games }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// INDEX -- game search results
router.get('/games/search/:name', (req, res, next) => {
    const name = req.params.name
    console.log(name)
    axios.get(`http://www.giantbomb.com/api/search/?api_key=${apiKey}&format=json&query="${name}"&resources=game&limit=25`)
        .then(apiRes => {
            
            // console.log('this is API Res', apiRes)
            res.body = apiRes.data.results
            // console.log('this is res', res.body)
            return res
        })
        .then((res) => res.status(200).json({results : res.body}))

        .catch(next)

})

// SHOW page for individual game
router.get('/games/:apiId', (req, res, next) => {
    const apiId = req.params.apiId
    axios.get(`http://www.giantbomb.com/api/game/${apiId}/?api_key=${apiKey}&format=json`)
        .then(apiRes => {
            res.body = apiRes.data.results
            return res
        })
        .then(res => res.status(200).json({results : res.body}))
        .catch(next)
})

// Update page for adding games to user library
router.patch('/games/mylibrary/:apiId', requireToken, (req, res, next) => {
    const apiId = req.params.apiId
    const userId = req.user.id
    findAndAddGame(apiId)
    User.findById(userId)
        .then(user => {
            if(!user.myGames.includes(apiId)) {
                user.myGames.push(apiId)
                user.save()
            }
        })
        .then(() => res.sendStatus(200))
        .catch(next)
})

// Update page for adding thumbnail to user's profile
router.patch('games/myfavorite/:thumbnailUrl', requireToken, (req, res, next) => {
    const thumbnail = req.params.thumbnailUrl
    const userId = req.user.id
    User.findById(userId)
        .then(user => {
            user.thumbnail.push(thumbnail)
            user.save()
        })
        .then(() => res.sendStatus(200))
        .catch(next) 
})



// SHOW
// GET /games/5a7db6c74d55bc51bdf39793
// router.get('/games/:id', requireToken, (req, res, next) => {
// 	// req.params.id will be set based on the `:id` in the route
// 	Game.findById(req.params.id)
// 		.then(handle404)
// 		// if `findById` is succesful, respond with 200 and "game" JSON
// 		.then((game) => res.status(200).json({ game: game.toObject() }))
// 		// if an error occurs, pass it to the handler
// 		.catch(next)
// })

// CREATE
// POST /games
router.post('/games', requireToken, (req, res, next) => {
	// set owner of new game to be current user
	req.body.game.owner = req.user.id

	Game.create(req.body.game)
		// respond to succesful `create` with status 201 and JSON of new "game"
		.then((game) => {
			res.status(201).json({ game: game.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
// PATCH /games/5a7db6c74d55bc51bdf39793
router.patch('/games/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.game.owner

	Game.findById(req.params.id)
		.then(handle404)
		.then((game) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, game)

			// pass the result of Mongoose's `.update` to the next `.then`
			return game.updateOne(req.body.game)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /games/5a7db6c74d55bc51bdf39793
router.delete('/games/:id', requireToken, (req, res, next) => {
	Game.findById(req.params.id)
		.then(handle404)
		.then((game) => {
			// throw an error if current user doesn't own `game`
			requireOwnership(req, game)
			// delete the game ONLY IF the above didn't throw
			game.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
