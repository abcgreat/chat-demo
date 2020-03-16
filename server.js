const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const Chatkit = require('@pusher/chatkit-server')

const app = express()

const chatkit = new Chatkit.default({
  instanceLocator: 'v1:us1:c44f94c0-2358-4c15-9b8d-aa680590b88b',
  key: '104cdd85-7f85-4b96-b4a2-19f388fa15b8:IzcYP+FIfOyc1lWIoaFF6hl3INFopnOpPmmZQGoRepI=',
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.post('/users', (req, res) => {
   const { username } = req.body
   chatkit
     .createUser({
       id: username,
       name: username
     })
     .then(() => res.sendStatus(201))
     .catch(error => {
       if (error.error === 'services/chatkit/user_already_exists') {
         res.sendStatus(200)
       } else {
         res.status(error.status).json(error)
       }
     })
 })
 
 app.post('/authenticate', (req, res) => {
   const authData = chatkit.authenticate({ userId: req.query.user_id })
   res.status(authData.status).send(authData.body)
 })
  
const PORT = 3001
app.listen(PORT, err => {
  if (err) {
    console.error(err)
  } else {
    console.log(`Running on port ${PORT}`)
  }
})
