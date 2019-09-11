'use strict'
const express = require('express')
const SocketServer = require('ws').Server
const path = require('path')

const GameDispatcher = require('./game-server/GameDispatcher')

const PORT = process.env.PORT || 5000

// for testing only
const testConfig = require('./game-server/testQuizConfig')

const app = express().use(express.static('public'))

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`))

app.get('/quiz/:id/launch', async (req, res) => {
    // TODO get quiz config from database using id in path
    try {
        // const quizId = req.params.id

        // get quiz config from database
        const quizConfig = JSON.parse(JSON.stringify(testConfig))

        const game = dispatcher.createNewGame(quizConfig)
        await game.fetchQuestions()

        console.log('Game loaded - id: ' + game.id)
        res.redirect('/index.html?admin=' + game.id)
    } catch (e) {
        console.error(e)
        res.status(500).send('An error occurred while launching the game')
    }
})

const dispatcher = new GameDispatcher()
const wss = new SocketServer({ server })

wss.on('connection', ws => {
    console.log('Client connected')
    ws.on('close', () => console.log('Client disconnected'))
    ws.onmessage = message => {
        const data = JSON.parse(message.data)

        dispatcher.dispatchMessage(data, ws)
    }
})
