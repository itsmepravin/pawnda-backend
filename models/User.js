import mongoose from 'mongoose'
import crypto from 'crypto'

import jwt from 'jsonwebtoken'

const userSchema = mongoose.Schema({
	name : String,
	username : {
		type : String,
		required : true
	},
	email : {
		type : String,
		required : true
	},
	password : {
		type : String,
		required : [true, "Password is required!"],
		minLength : [5, "Password cannot be less than 5 characters!"]
	},
	avatarUrl: String,
	resetPasswordToken: String,
	resetPasswordExpire : Date
})

userSchema.set('toJSON', {
	transform : (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__V
	}
})

userSchema.methods.getJWTToken = async function(tokenForUser) {
	return jwt.sign(tokenForUser, process.env.JWT_SECRET, { expiresIn : process.env.JWT_EXPIRE })
}

userSchema.methods.getResetPasswordToken = async function() {
	const resetToken = await crypto.randomBytes(20).toString("hex")

	this.resetPasswordToken = await crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex")

	this.resetPasswordExpire = Date.now() + 10 * (60 * 1000)
	return resetToken
}

const User = mongoose.model('User', userSchema)

export default User