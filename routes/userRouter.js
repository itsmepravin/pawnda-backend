import express from 'express'

import { login, signup, forgotpassword, resetpassword } from '../controllers/userControllers.js'

const userRouter = express.Router()

userRouter.post('/login', login)
userRouter.post('/signup', signup)
userRouter.post('/forgotpassword', forgotpassword)
userRouter.put('/resetpassword/:resetToken', resetpassword)

export default userRouter