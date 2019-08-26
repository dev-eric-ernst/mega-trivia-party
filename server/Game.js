const axios = require('axios')
const uniqid = require('uniqid')
const URL_ROOT = 'https://opentdb.com/api.php?'
const categories = require('./categories')

const QUIZ_STATES = {
    initial: 'initial',
    lobby: 'lobby'
}
const TYPES = {
    player: 'player',
    admin: 'admin'
}
const ACTIONS = {
    join: 'join',
    joinError: 'join error',
    waiting: 'waiting',
    adminWaiting: 'adminWaiting',
    launch: 'launch',
    question: 'question',
    score: 'score'
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

//The maximum is exclusive and the minimum is inclusive
const getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

const orderAnswers = questions => {
    questions.forEach(question => {
        const indices = [0, 1, 2, 3]
        ;[question.correctIndex] = indices.splice(
            getRandomInt(0, indices.length),
            1
        )

        question.incorrectIndex = []
        for (let i = 0; i < 3; i++) {
            let [idx] = indices.splice(getRandomInt(0, indices.length), 1)
            question.incorrectIndex.push(idx)
        }
    })
}

exports.Game = class {
    constructor(quiz) {
        this.id = uniqid.time()
        this.state = QUIZ_STATES.initial
        this.config = quiz
        this.players = {}
        this.adminConnection = null
        this.sendPlayersWaitingCount = this.sendPlayersWaitingCount.bind(this)
        this.currentQuestion = 0
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
        this.state = QUIZ_STATES.lobby
        this.waitingInterval = setInterval(this.sendPlayersWaitingCount, 2000)
    }

    sendPlayersWaitingCount() {
        const players = Object.keys(this.players)
        const numPlayers = players.length
        let message

        if (this.adminConnection) {
            message = JSON.stringify({
                action: ACTIONS.adminWaiting,
                players
            })
            this.adminConnection.send(message)
        }

        message = JSON.stringify({
            action: ACTIONS.waiting,
            count: numPlayers
        })

        for (const player in this.players) {
            this.players[player].connection.send(message)
        }
    }

    launchGame() {
        // cancel interval that updates lobbies
        clearInterval(this.waitingInterval)
        this.sendNextQuestion()
    }

    sendNextQuestion() {
        let nextQuestion = this.config.questions[this.currentQuestion]
        nextQuestion = {
            ...nextQuestion,
            revealAnswersDelay: this.config.revealAnswersDelay,
            answerTime: this.config.answerTime
        }

        this.currentQuestion++
        const json = JSON.stringify({
            action: ACTIONS.question,
            question: nextQuestion
        })

        this.adminConnection.send(json)
        Object.values(this.players).forEach(player => {
            player.connection.send(json)
        })
    }

    receiveMessage(message, ws) {
        if (message.type === TYPES.player) {
            switch (message.action) {
                case ACTIONS.join:
                    // check display name is unique
                    if (this.players.hasOwnProperty(message.display)) {
                        const errorData = {
                            action: ACTIONS.joinError,
                            message: `Display name \'${message.display}\' already taken`
                        }
                        ws.send(JSON.stringify(errorData))
                    } else {
                        this.players[message.display] = {
                            connection: ws,
                            score: 0
                        }
                        console.log(
                            `${message.display} joined game ${message.game}`
                        )
                    }
                    break
                case ACTIONS.score:
                    console.log('score received', message)
                    break
                default:
                    throw Error('Unrecognized action type: ' + message.action)
            }
        } else if (message.type === TYPES.admin) {
            switch (message.action) {
                case ACTIONS.adminWaiting:
                    this.adminConnection = ws
                    break
                case ACTIONS.launch:
                    this.launchGame()
                    break
                default:
                    throw Error('Unrecognized action type: ' + message.action)
            }
        } else {
            throw Error('Unrecognized message type: ' + message.type)
        }
    }
}
