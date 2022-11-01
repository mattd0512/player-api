const mongoose = require('mongoose')

// const Review = require('./review')

const gameSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
        imgUrl: String,
        thumbnailUrl: String,
        scores: [],
		apiId: {
			type: String,
			required: true,
            unique: true
		},
	},
	{
		timestamps: true,
        toObject: { virtuals : true },
        toJSON: { virtuals : true }
	}
)

gameSchema.virtual('avgScore').get(function () {
    let avgScore
    if(this.scores.length > 0) {
        avgScore = 0
        this.scores.forEach(score => {
            avgScore = avgScore + score
        })
        avgScore = avgScore/this.scores.length
        avgScore = Math.round(avgScore * 2)/2

    } else {
        avgScore = "No reviews yet..."
    }
    return avgScore
})

    
//     let avgScore
//     return Review.find({ gameId: this.apiId})
//         .then(reviews => {
//             avgScore = 0
//             reviews.forEach(review => {
//                 // console.log(review.score)
                
//                 avgScore = avgScore + review.score
//             })
            
//             avgScore = avgScore/reviews.length
//             avgScore = Math.round(avgScore * 2)/2
//             // console.log(avgScore)
//             return avgScore
//         })
//         // .then((length) => {
//         //     avgScore = avgScore/length
//         //     avgScore = Math.round(avgScore * 2)/2
//         //     return avgScore
//         // })
//         .finally(() => {
//             console.log(avgScore)
//             return avgScore
//         })
//         .catch(console.error)
//     // console.log(avgScore)
//     // let result = await promise.json()
//     // setTimeout(() => {return avgScore}, 5000)
//     // return result
// })

module.exports = mongoose.model('Game', gameSchema)
