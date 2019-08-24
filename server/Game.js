const axios = require('axios')
const uniqid = require('uniqid')
const URL_ROOT = 'https://opentdb.com/api.php?'
const categories = require('./categories')

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
exports.QUIZ_STATES = {
    INITIAL: 'initial',
    LOBBY: 'lobby'
}
exports.Game = class {
    constructor(quiz) {
        this.id = uniqid.time()
        this.state = exports.QUIZ_STATES.INITIAL
        this.config = quiz
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
        this.state = exports.QUIZ_STATES.LOBBY
    }
}
