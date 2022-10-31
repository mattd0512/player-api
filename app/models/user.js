const mongoose = require('mongoose')

const platformSchema = require('./platform')

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},

        username: {
            type: String,
            required: true,
            unique: true,
        },
        thumbnail: {
            type: String,
        },
        myGames: [],
        platforms: [platformSchema],
		hashedPassword: {
			type: String,
			required: true,
		},
		token: String,
	},
	{
		timestamps: true,
		toObject: {
            virtuals: true,
			transform: (_doc, user) => {
				delete user.hashedPassword
				return user
			},
		},
        toJSON: { virtuals: true }
	}
)

// virtuals
// this virtual is to sanitize the username to allow the display to be case sensitive but the validation to not be. Will also prevent 'Bryan' and 'bryan' to not be considered seperate valid usernames
userSchema.virtual('sanitizedUsername').get(function () {
    return this.username.toLowerCase()
})

module.exports = mongoose.model('User', userSchema)
