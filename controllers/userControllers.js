import bcrypt from 'bcryptjs'

import User from '../models/User.js'

import crypto from 'crypto'

import { sendEmail } from '../utils/middleware.js'

export const login = async (req, res) => {
	const { username, password } = req.body
	const existingUser = await User.findOne({ username })

	if(!existingUser) return res.status(404).json({"ERROR" : "User does not exists!"})

	const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

	if(!isPasswordCorrect) return res.status(409).json({"ERROR" : "Password is incorrect!"})

	const tokenForUser = {
		id : existingUser._id,
		username : existingUser.username
	}

	const token = await existingUser.getJWTToken(tokenForUser)

	res.status(200).json({
		token,
		result : {
			email : existingUser.email,
			id : existingUser._id,
			name : existingUser.name,
			username : existingUser.username,
			avatarUrl: existingUser.avatarUrl
		}
	})
}

export const signup = async (req, res) => {
	const { fName, lName, email, username, password, confirmPassword, avatarUrl } = req.body

	const existingUser = await User.findOne({ username })

	if(existingUser) return res.status(400).json({"ERROR" : "User already exists. Try something different!"})

	if(password !== confirmPassword) return res.status(400).json({"ERROR" : "Passwords and confirm password must be the same!"})

	const hashedPassword = await bcrypt.hash(password, 12)

	const user = await User.create({
		name : `${fName} ${lName}`,
		username,
		email,
		password : hashedPassword,
		avatarUrl,
		resetPasswordToken: "",
		resetPasswordExpire: Date.now()
	})

	const newUser = await user.save()

	const tokenForUser = {
		id : newUser._id,
		username : newUser.username
	}

	const token = await user.getJWTToken(tokenForUser)

	res.status(201).json({
		token,
		result : {
			email : newUser.email,
			id : newUser._id,
			name : newUser.name,
			username : newUser.username,
			avatarUrl: newUser.avatarUrl
		}
	})
}

export const forgotpassword = async (req, res) => {
	const { email } = req.body
	const user = await User.findOne({ email })

	if(!user) return res.status(404).json({"ERROR" : "Invalid or non-existent email address!"})

	const resetToken = await user.getResetPasswordToken()
	
	await user.save()

	const resetUrl = `https://pawnda.netlify.app/auth/resetpassword/${resetToken}`

	const options = {
		to : user.email,
		subject: `Reset Password Request from ${user.username}`,
		html: `
				<h1>You have requested for a password reset for user ${user.username}</h1>
				<p>Please click on the link below to reset your password<p>
				<p>This link will be only valid for 10 minutes</p>
				<a href=${resetUrl} clicktracking="off">${resetUrl}</a>
			  `
	}

	try {
		await sendEmail(options)
		res.status(200).json({"SUCCESS" : `The reset link has been sent to ${user.email}.`})
	} catch(error) {
		user.resetPasswordToken = undefined
		user.resetPasswordExpire = undefined
		await user.save()
		res.status(500).json({"ERROR" : "Error sending mail"})
	}
}

export const resetpassword = async (req, res, next) => {
	const { password } = req.body
	const { resetToken } = req.params

	const resetPasswordToken = await crypto.createHash("sha256").update(resetToken).digest("hex")
	
	try {
		const user = await User.findOne({
			resetPasswordToken,
			resetPasswordExpire : { $gt : Date.now() }
		})
		if(!user) return res.status(400).json({"ERROR" : error})

		const hashedPassword = await bcrypt.hash(password, 12)
		await User.findByIdAndUpdate(user._id, {password: hashedPassword, resetPasswordToken: undefined, resetPasswordExpire: undefined}, {new: true})
		res.status(201).json({"SUCCESS" : "Password Reset Successful."})
	} catch(error) {
		res.status(400).json({"ERROR" : error.message})
	}
}