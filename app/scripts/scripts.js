const express = require('express')
const Game = require('../models/game')
const router = express.Router()
const apiKey = require('../APIKey')
const game = require('../models/game')
const axios = require('axios')

const findAndAddGame = (apiId) => {
    console.log('start')
    Game.find({ apiId : apiId})
        .then(game => {
            console.log(game.length)
            if(game.length === 0) {
                axios.get(`http://www.giantbomb.com/api/game/${apiId}/?api_key=${apiKey}&format=json`)
                .then(apiRes => {
                    const game = {
                       title: apiRes.data.results.name,
                       description: apiRes.data.results.deck,
                       apiId:  apiRes.data.results.id 
                    }
                    return game
                })
                .then(game => {
                    Game.create(game)
                })
                .catch(console.error)
        
            } else {return}
        }) 
        return  
}

module.exports = findAndAddGame