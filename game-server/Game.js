const axios = require('axios')
const uniqid = require('uniqid')
const URL_ROOT = 'https://opentdb.com/api.php?'
const categories = require('./categories')

const ACTIONS = {
    join: 'join',
    joinError: 'joinError',
    waiting: 'waiting',
    adminWaiting: 'adminWaiting',
    launch: 'launch',
    question: 'question',
    score: 'score',
    scoreboard: 'scoreboard',
    winner: 'winner',
}
exports.ACTIONS = ACTIONS

const buildRequestMap = questions => {
    // key captures category and difficulty
    // format is 10~medium
    const requestMap = questions.reduce((accumulator, question) => {
        let key = `${question.category}~${question.difficulty}`
        if (accumulator[key]) {
            accumulator[key]++
        } else {
            accumulator[key] = 1
        }
        return accumulator
    }, {})

    return requestMap
}
const buildUrl = (amount, category, difficulty) => {
    //https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple
    let queryString = 'amount=' + amount
    if (category !== 'any') {
        queryString += `&category=${category}`
    }
    if (difficulty !== 'any') {
        queryString += `&difficulty=${difficulty}`
    }
    queryString += '&type=multiple'

    return URL_ROOT + queryString
}

const buildRequestList = requestMap => {
    const requestList = []
    for (let key in requestMap) {
        let [category, difficulty] = key.split('~')
        let url = buildUrl(requestMap[key], category, difficulty)
        requestList.push({ category, difficulty, url })
    }
    return requestList
}

const orderAnswers = questions => {
    questions.forEach(question => {
        const indices = [0, 1, 2, 3]
        ;[question.correctIndex] = indices.splice(
            Math.floor(Math.random * indices.length),
            1
        )

        question.incorrectIndex = []
        for (let i = 0; i < 3; i++) {
            let [idx] = indices.splice(
                Math.floor(Math.random * indices.length),
                1
            )
            question.incorrectIndex.push(idx)
        }
    })
}

exports.Game = class {
    constructor(quiz, deleteThis) {
        this.id = uniqid.time()
        this.config = quiz
        this.players = {}
        this.adminConnection = null
        this.currentQuestion = 0

        this.sendPlayersWaitingCount = this.sendPlayersWaitingCount.bind(this)

        // call this when game is over
        this.deleteThis = deleteThis
    }

    async fetchQuestions() {
        const questions = this.config.questions
        const requestMap = buildRequestMap(questions)
        const requestList = buildRequestList(requestMap)

        // make multiple api calls in sequence (to take it easy on the API)
        for (const request of requestList) {
            try {
                const { data } = await axios.get(request.url)
                if (data.response_code !== 0) {
                    console.log(request.url)
                    console.log(data)
                    throw Error('Error fetching questions')
                }

                // find first matching question and populate it
                for (const result of data.results) {
                    for (const question of questions) {
                        if (
                            categories.map[question.category] ===
                                result.category &&
                            question.difficulty === result.difficulty &&
                            !question.text
                        ) {
                            question.text = result.question
                            question.correctAnswer = result.correct_answer
                            question.incorrectAnswers = result.incorrect_answers
                            break
                        }
                    }
                }
            } catch (e) {
                console.error(e)
                throw Error('Error fetching questions')
            }
        }

        orderAnswers(questions)
    }

    sendPlayersWaitingCount() {
        const players = Object.keys(this.players)
        const message = {
            action: ACTIONS.adminWaiting,
            game: this.id,
            players,
        }

        this.adminConnection.send(JSON.stringify(message))

        message.action = ACTIONS.waiting
        for (const player in this.players) {
            this.players[player].connection.send(JSON.stringify(message))
        }
    }

    launchGame() {
        this.sendNextQuestion()
    }

    sendNextQuestion() {
        let nextQuestion = this.config.questions[this.currentQuestion]
        nextQuestion = {
            ...nextQuestion,
            revealAnswersDelay: this.config.revealAnswersDelay,
            answerTime: this.config.answerTime,
        }

        this.currentQuestion++
        const json = JSON.stringify({
            action: ACTIONS.question,
            game: this.id,
            question: nextQuestion,
        })

        this.adminConnection.send(json)
        Object.values(this.players).forEach(player => {
            player.connection.send(json)
        })
    }

    scoreboard() {
        // convert players map to an array
        const playersArray = Object.keys(this.players).map(key => ({
            score: this.players[key].score,
            previousScore: this.players[key].scoreReceived
                ? this.players[key].previousScore
                : 0,
            display: key,
        }))
        playersArray.sort((a, b) => b.score - a.score) // highest score first

        // reset score received flags
        Object.values(this.players).forEach(player => {
            player.scoreReceived = false
        })

        if (this.currentQuestion < this.config.questions.length) {
            const json = JSON.stringify({
                action: ACTIONS.scoreboard,
                game: this.id,
                scores: playersArray,
                current: this.currentQuestion,
                total: this.config.questions.length,
            })
            this.adminConnection.send(json)
            Object.values(this.players).forEach(player => {
                player.connection.send(json)
            })
        } else {
            // game finished
            const winner = playersArray[0]
            const loser = playersArray[playersArray.length - 1]

            const json = JSON.stringify({
                action: ACTIONS.winner,
                game: this.id,
                scores: playersArray,
            })

            this.adminConnection.send(json)
            Object.values(this.players).forEach(player => {
                player.connection.send(json)
            })

            // close connections
            console.log('shutting down game ' + this.id)
            this.adminConnection.close()
            Object.values(this.players).forEach(player => {
                player.connection.close()
            })
            this.deleteThis(this.id)
        }
    }

    receiveMessage(message, ws) {
        switch (message.action) {
            case ACTIONS.join:
                // check display name is unique
                if (this.players.hasOwnProperty(message.display)) {
                    const errorData = {
                        action: ACTIONS.joinError,
                        message: `Display name \'${message.display}\' already taken`,
                    }
                    ws.send(JSON.stringify(errorData))
                } else {
                    this.players[message.display] = {
                        connection: ws,
                        score: 0,
                        previousScore: 0,
                        scoreReceived: false,
                    }
                    console.log(
                        `${message.display} joined game ${message.game}`
                    )
                    this.sendPlayersWaitingCount()
                }
                break
            case ACTIONS.score:
                const player = this.players[message.display]
                const score = message.score ? message.score : 0 // 0 if no answer was submitted
                player.score += score
                player.previousScore = score
                player.scoreReceived = true
                break
            case ACTIONS.adminWaiting:
                this.adminConnection = ws
                break
            case ACTIONS.launch:
                this.launchGame()
                break
            case ACTIONS.scoreboard:
                this.scoreboard()
                break
            case ACTIONS.question:
                this.sendNextQuestion()
                break
            default:
                throw Error('Unrecognized action type: ' + message.action)
        }
    }
}
