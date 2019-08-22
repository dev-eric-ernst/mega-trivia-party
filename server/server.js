'use strict'

const express = require('express')
const SocketServer = require('ws').Server
const path = require('path')

const PORT = process.env.PORT || 3000
//const INDEX = path.join(__dirname, '../index.html')

const candidates = {
    candidates: [
        {
            id: '577805c3e30089e66c1ede16',
            name: 'Spongebob',
            votes: 2
        },
        {
            id: '577805c3e30089e66c1ede18',
            name: 'Squidward',
            votes: 1
        },
        {
            id: '577805c3e30089e66c1ede19',
            name: 'Sandy',
            votes: 0
        },
        {
            id: '577805c3e30089e66c1ede17',
            name: 'Patrick',
            votes: 0
        },
        {
            id: '577805c3e30089e66c1ede1a',
            name: 'Gary',
            votes: 1
        }
    ]
}

const server = express()
    .use(express.static('public'))
    .use(allowCrossDomain)
    .get('/bb', (req, res) => res.json(candidates))
    .listen(PORT, () => console.log(`Listening on ${PORT}`))

const wss = new SocketServer({ server })

wss.on('connection', ws => {
    console.log('Client connected')
    ws.on('close', () => console.log('Client disconnected'))
    ws.onmessage = message => {
        console.log('WTF?')

        console.log(message.data)
    }
})

setInterval(() => {
    wss.clients.forEach(client => {
        client.send(new Date().toTimeString())
    })
}, 1000)
