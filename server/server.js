'use strict'
const express = require('express')
const SocketServer = require('ws').Server
//const path = require('path')

const GameDispatcher = require('./GameDispatcher')
const { Game } = require('./Game')
const testConfig = require('./testQuizConfig')

const PORT = process.env.PORT || 3000
//const INDEX = path.join(__dirname, '../index.html')
const cats = require('./routes/cats') // for WDI bitkittens assignment

const server = express()
    .use(express.static('public'))
    .use('/cats', cats)
    .listen(PORT, () => console.log(`Listening on ${PORT}`))

const wss = new SocketServer({ server })

const dispatcher = new GameDispatcher()

// for now manually add a game
const game = new Game(testConfig)

;(async () => {
    try {
        await game.fetchQuestions()

        dispatcher.addGame(game)
        console.log('Game loaded - id: ' + game.id)
    } catch (e) {
        console.error(e)
    }
})()

wss.on('connection', ws => {
    console.log('Client connected')
    ws.on('close', () => console.log('Client disconnected'))
    ws.onmessage = message => {
        console.log(message.data)
    }
})

setInterval(() => {
    wss.clients.forEach(client => {
        client.send(new Date().toTimeString())
    })
}, 1000)
