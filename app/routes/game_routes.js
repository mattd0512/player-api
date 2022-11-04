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
// router.get('/games', requireToken, (req, res, next) => {
// 	Game.find()
// 		.then((games) => {
// 			// `games` will be an array of Mongoose documents
// 			// we want to convert each one to a POJO, so we use `.map` to
// 			// apply `.toObject` to each one
// 			return games.map((game) => game.toObject())
// 		})
// 		// respond with status 200 and JSON of the games
// 		.then((games) => res.status(200).json({ games: games }))
// 		// if an error occurs, pass it to the handler
// 		.catch(next)
// })

// INDEX -- game search results
router.get('/games/search/:name', (req, res, next) => {
    const name = req.params.name
    // console.log('what was searched for: ', name)
    axios.get(`http://www.giantbomb.com/api/search/?api_key=${apiKey}&format=json&query="${name}"&resources=game&limit=25`)
        .then(handle404)
        .then(apiRes => {
            
            // console.log('this is API Res', apiRes)
            res.body = apiRes.data.results
            // console.log('this is res', res.body)
            return res
        })
        .then((res) => res.status(200).json({results : res.body}))

        .catch(next)

})

// SHOW page for individual local game
router.get('/games/library/:apiId', (req, res, next) => {
    const apiId = req.params.apiId
    Game.findOne({ apiId: apiId })
        // .then(handle404)
        .then((game) => 
            res.status(200).json({ game: game }))
        .catch(next)
})


// SHOW page for individual game
router.get('/games/:apiId', (req, res, next) => {
    const apiId = req.params.apiId
    axios.get(`http://www.giantbomb.com/api/game/${apiId}/?api_key=${apiKey}&format=json`)
        .then(handle404)
        .then(apiRes => {
            res.body = apiRes.data.results
            return res
        })
        .then(res => res.status(200).json({results : res.body}))
        .catch(next)
})

// Update page for removing a game from a user's library
router.patch('/games/mylibrary/remove/:apiId', requireToken, (req, res, next) => {
    const apiId = req.params.apiId
    const userId = req.user.id
    User.findById(userId)
        .then(handle404)
        .then(user => {
            const myGames =user.myGames.slice()
            const ind = myGames.indexOf(apiId)
            if (ind > -1) {
                myGames.splice(ind, 1)
            }
            user.myGames = myGames
            user.save()
            return user
        })
        .then((user) => res.status(201).json({ user: user }))
        .catch(next)
})

// Update page for adding games to user library
router.patch('/games/mylibrary/:apiId', requireToken, (req, res, next) => {
    const apiId = req.params.apiId
    const userId = req.user.id
    findAndAddGame(apiId)
    User.findById(userId)
        .then(handle404)
        .then(user => {
            if(!user.myGames.includes(apiId)) {
                user.myGames.push(apiId)
                user.save()
                return user
            }
        })
        .then((user) => res.status(201).json({ user: user }))
        .catch(next)
})

// Update page for adding thumbnail to user's profile
router.patch('/games/myfavorite/:apiId', requireToken, (req, res, next) => {
    const apiId = req.params.apiId
    const userId = req.user.id
    let thumbnail        
    Game.findOne({apiId : apiId})
        .then(handle404)
        .then(game => {
            console.log(game.avgScore)
            thumbnail = game.thumbnailUrl
        })
        .then(() => {
            User.findById(userId)
                .then(handle404)
                .then(user => {
                    user.thumbnail = thumbnail
                    user.save()
                    return user
                })
                .then((user) => res.status(201).json({ user: user }))
                .catch(next)
        })
        .catch(next) 
})


module.exports = router
