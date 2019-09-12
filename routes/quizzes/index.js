const express = require('express')
const router = express.Router()
const dispatcher = require('../../game-server/GameDispatcher')
// for testing only
const testConfig = require('../../game-server/testQuizConfig')

router.get('/:id/launch', async (req, res) => {
    // TODO get quiz config from database using id in path
    try {
        // const quizId = req.params.id

        // get quiz config from database
        const quizConfig = JSON.parse(JSON.stringify(testConfig))

        const game = dispatcher.createNewGame(quizConfig)
        await game.fetchQuestions()

        console.log('Game loaded - id: ' + game.id)

        // for dev only
        console.log(`${req.hostname}:3000/index.html?admin=${game.id}`)

        res.redirect(`//${req.hostname}:3000/index.html?admin=${game.id}`)
    } catch (e) {
        console.error(e)
        res.status(500).send('An error occurred while launching the game')
    }
})
router.get('/', (req, res) => {
    res.send('/quizzes route')
})

module.exports = router
