// Import all the things

const express = require('express')
const Game = require('../models/game')
const router = express.Router()
const apiKey = require('../APIKey')
const axios = require('axios')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404


// this script runs whenever a user adds a game to their collection. It takes the minimum amount of data from the GiantBomb api and adds it to our own database so that we can access it when a user looks at their own or another user's profile
// we are also using this when reviewing a game. A user should be able to review a game without it being in their collection
// if this is the case, we need to add it to our DB and modify our DB for the average score to work--('score' will only be passed when this event is invoked via a reviews path)
const findAndAddGame = (apiId, score) => {

    // we're doing find rather than findOne here because even though we know we will at mose get one result we want a return even if it is empty to prevent a could not find error
    Game.find({ apiId : apiId})
        .then(games => {
            if(games.length === 0) {
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
            // here, we push the score from a review if the game is already in our DB. Doing it here prevents us from calling our DB again since we already had to when posting a review
            } else if (games.length > 0 && score) {
                // console.log(games[0])
                games[0].scores.push(score)
                games[0].save()
            }
        }) 
}

module.exports = findAndAddGame