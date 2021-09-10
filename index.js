import express from'express'
import mongoose from 'mongoose'
import cors from 'cors'
import asyncErrors from 'express-async-errors'

import dogsRouter from './routes/dogsRouter.js'
import userRouter from './routes/userRouter.js'
import { unknownEndpoint, errorHandler } from './utils/middleware.js'
import { PORT, MONGODB_URI } from './utils/config.js'
import morgan from 'morgan'

asyncErrors

const app = express()

morgan.token('body', (req, res) => JSON.stringify(req.body))

mongoose.connect(MONGODB_URI, {useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:false, useCreateIndex:true})
.then(() => console.log(`Successfully connected to the MongoDB database.`))
.catch(error => console.log(`Failed to connect to the database!`, error.message))

app.use(express.static('build'))

app.use(express.json({ limit: "30mb", extended: true}))
app.use(express.urlencoded({ limit: "30mb", extended: true}))

app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

app.use(cors())

app.use('/dogs', dogsRouter)
app.use('/user', userRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

app.listen(PORT, () => console.log(`Server up and running at PORT : ${PORT}`))