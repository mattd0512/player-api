const express = require('express')
const Game = require('../models/game')
const router = express.Router()
const apiKey = require('../APIKey')
const game = require('../models/game')
const axios = require('axios')

const findAndAddGame = (apiId) => {
    Game.find({ apiId : apiId})
        .then(game => {
            if(game.length === 0) {
                axios.get(`http://www.giantbomb.com/api/game/${apiId}/?api_key=${apiKey}&format=json`)
                .then(apiRes => {
                    const game = {
                       title: apiRes.data.results.name,
                       description: apiRes.data.results.deck,
                       imgUrl: apiRes.data.reults.image.original_url,
                       thumbnailUrl: apiRes.data.reults.image.thumb_url,
                       apiId:  apiRes.data.results.id 
                    }
                    return game
                })
                .then(game => {
                    Game.create(game)
                })
                .catch(console.error)
            }
        })  
}

module.exports = findAndAddGame