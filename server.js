'use strict'
const express = require('express')
const SocketServer = require('ws').Server
const dispatcher = require('./game-server/GameDispatcher')
const router = require('./routes')
const path = require('path')

const app = express()
app.use('/', router)

// serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`))

// set up websockets heartbeat
function noop() {}

function heartbeat() {
    this.isAlive = true
}

const wss = new SocketServer({ server })

wss.on('connection', ws => {
    console.log('Client connected')

    ws.isAlive = true
    ws.on('pong', heartbeat)

    ws.on('close', () => console.log('Client disconnected'))
    ws.onmessage = message => {
        const data = JSON.parse(message.data)

        dispatcher.dispatchMessage(data, ws)
    }
})

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate()

        ws.isAlive = false
        ws.ping(noop)
    })
}, 30000)
