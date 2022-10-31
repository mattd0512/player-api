const express = require('express')
const game = require('../models/game')
const Game = require('../models/game')
const router = express.Router()
const apiKey = require('../APIKey')

const findGame = (apiId) => {
    if(!Game.find({ apiId : apiId})) {
        router.post('/games', requireToken, (req, res, next) => {
            req.body.owner = req.user.apiId
            axios.get(`http://www.giantbomb.com/api/game/${apiId}/?api_key=${apiKey}&format=json`)
            .then(apiRes => {
                const game = {
                   title: apiRes.results.name,
                   description: apiRes.results.deck,
                   apiId: apiRes.results.apiId 
                }
            return game
            })
            .then(game => {
                Game.create(game)
            })
            .catch(next)
        })
    }    
}

module.exports = findGame