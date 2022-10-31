const mongoose = require ('mongoose')

const platformSchema= new mongoose.Schema ({
    platform: {
        type: String,
        required: true,
        enum: [
            "XBOX Live",
            "PSN",
            "Nintendo",
            "Steam",
            "GoG",
            "Epic"
        ]
    },
    name: {
        type: String,
        required: true
    }
})

module.exports = platformSchema