const express = require('express')
const Game = require('../models/game')
const router = express.Router()
const apiKey = require('../APIKey')
const axios = require('axios')
const customErrors = require('../../lib/custom_errors')
const game = require('../models/game')
const handle404 = customErrors.handle404


// this script runs whenever a user adds a game to their collection. It takes the minimum amount of data from the GiantBomb api and adds it to our own database so that we can access it when a user looks at their own or another user's profile
const findAndAddGame = (apiId, score) => {

    // we're doing find rather than findOne here because even though we know we will at mose get one result we want a return even if it is empty to prevent a could not find error
    Game.find({ apiId : apiId})
        .then(game => {
            if(game.length === 0) {
                axios.get(`http://www.giantbomb.com/api/game/${apiId}/?api_key=${apiKey}&format=json`)
                .then(handle404)
                .then(apiRes => {
                    const game = {
                       title: apiRes.data.results.name,
                       description: apiRes.data.results.deck,
                       imgUrl: apiRes.data.results.image.original_url,
                       thumbnailUrl: apiRes.data.results.image.thumb_url,
                       apiId:  apiRes.data.results.id 
                    }
                    if (score) {
                        game.scores = [score]
                    }
                    return game
                })
                .then(game => {
                    Game.create(game)
                })
                .catch(console.error)
            } else if (game.length > 0 && score) {
                console.log(game[0])
                game[0].scores.push(score)
                game[0].save()
            }
        }) 
}

module.exports = findAndAddGame