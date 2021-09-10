import mongoose from 'mongoose'

const dogsSchema = mongoose.Schema({
	name: {
		type: String,
		required: [true, "Name field cannot be empty!"]
	},
	beenTogether : Number,
	breed : String,
	age: Number,
	likes : {
		type: [String],
		default : []
	},
	instagram: String,
	owner: String,
	tags: [String],
	selectedFile: {
		type: Array,
		default: []
	},
	avatarUrl: String,
	createdAt: {
		type: Date,
		default: new Date()
	}
})

dogsSchema.set('toJSON', {
	transform : ( document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

const Dogs = mongoose.model('Dogs', dogsSchema)

export default Dogs