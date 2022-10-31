const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
	{
		comment: {
			type: String,
			required: true,
		},
		score: {
			type: Number,
			required: true,
            enum: [1, 2, 3, 4, 5]
		},
        gameId : {
            type: String,
            required: true
        },
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
	},
	{
		timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
	}
)


module.exports = mongoose.model('Review', reviewSchema)
