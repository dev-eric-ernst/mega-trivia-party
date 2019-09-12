'use strict'
const express = require('express')
const SocketServer = require('ws').Server
const dispatcher = require('./game-server/GameDispatcher')
const router = require('./routes')

//const path = require('path')

const PORT = process.env.PORT || 5000

const app = express()
app.use('/', router)

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`))

const wss = new SocketServer({ server })

wss.on('connection', ws => {
    console.log('Client connected')
    ws.on('close', () => console.log('Client disconnected'))
    ws.onmessage = message => {
        const data = JSON.parse(message.data)

        dispatcher.dispatchMessage(data, ws)
    }
})
