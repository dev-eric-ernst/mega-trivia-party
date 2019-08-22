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
const cats = {
    cats: [
        {
            id: 44,
            name: 'Lanta',
            photo:
                'https://s3.amazonaws.com/bitmakerhq/resources/web-development/bitkittens/lanta.jpg',
            fun_fact: 'Likes to pretend she is a cat',
            created_at: '2016-06-30T20:11:32.647Z',
            updated_at: '2016-06-30T20:11:32.647Z'
        },
        {
            id: 41,
            name: 'Timone',
            photo:
                'https://s3.amazonaws.com/bitmakerhq/resources/web-development/bitkittens/timone.jpg',
            fun_fact: 'He likes to dress fancy',
            created_at: '2016-06-30T20:11:32.559Z',
            updated_at: '2016-06-30T20:11:32.559Z'
        },
        {
            id: 47,
            name: 'Sahara',
            photo:
                'https://s3.amazonaws.com/bitmakerhq/resources/web-development/bitkittens/sahara.jpg',
            fun_fact: 'likes laser pointers and is a nap enthusiast',
            created_at: '2016-06-30T20:11:32.775Z',
            updated_at: '2016-06-30T20:11:32.775Z'
        }
    ]
}
const server = express()
    .use(express.static('public'))
    .use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*') // update to match the domain you will make the request from
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        )
        next()
    })
    .get('/bb', (req, res) => res.json(candidates))
    .get('/cats', (req, res) => res.json(cats))
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
