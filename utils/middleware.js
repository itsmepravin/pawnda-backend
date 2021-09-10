import jwt  from 'jsonwebtoken'

import nodemailer from 'nodemailer'

export const unknownEndpoint = (req, res, next) => {
  res.status(404).send({"ERROR": "404 Page Not Found!"})
}

export const errorHandler = (error, req, res, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return res.status(400).json({"ERROR" : "Malformatted ID!"})
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({"ERROR" : error.message})
  }
  next(error)
}

export const auth = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1]
  const isJWTAuth = token.length < 500

  let decodedToken

  if(token && isJWTAuth) {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    req.userId = decodedToken.id
  } else {
    decodedToken = jwt.decode(token)

    req.userId = decodedToken.sub
  }
    next()
}

export const sendEmail = options => {
  const transporter = nodemailer.createTransport({
    service :  process.env.EMAIL_SERVICE,
    auth : {
      user : process.env.EMAIL_USERNAME,
      pass : process.env.EMAIL_PASSWORD
    }
  })

  const mailOptions = {
    from : process.env.EMAIL_FROM,
    to : options.to,
    subject : options.subject,
    html : options.html
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
      console.log(error)
    } else {
      console.log(info)
    }
  })
}