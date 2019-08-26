const SCORE_REFRESH_INTERVAL = 10
const INITIAL_SCORE = 10000
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
    question: 'question'
}

class Controller {
    constructor(ws) {
        this.ws = ws
    }

    processMessage(message) {
        const data = JSON.parse(message.data)
        switch (data.action) {
            case ACTIONS.joinError:
                this.lobbyError(data)
                break
            case ACTIONS.waiting:
                this.lobbyUpdate(data)
                break
            case ACTIONS.adminWaiting:
                this.adminLobbyUpdate(data)
                break
            case ACTIONS.question:
                this.setupQuestion(data.question)
                break
            default:
                alert('An error occurred')
                console.error('Invalid message action received', message)
        }
    }

    lobbyUpdate(message) {
        document.querySelector('#join-form').style.display = 'none'
        const display = document.querySelector('.lobby-status')

        display.textContent = `You and ${message.count - 1} other player${
            message.count === 2 ? '' : 's'
        } have joined this game`
    }
    lobbyError(errorData) {
        // TODO present errors
        alert(errorData.message)
    }
    adminLobbyUpdate(message) {
        const playersList = document.querySelector('.lobby-players')
        playersList.innerHTML = ''
        console.log(message)

        message.players.forEach(player => {
            let li = document.createElement('li')
            li.textContent = player
            playersList.appendChild(li)
        })
    }
    setupQuestion(question) {
        this.question = question
        document.querySelector('.lobby-display').style.display = 'none'
        document.querySelector('.admin-lobby-display').style.display = 'none'
        document.querySelector('.question-display').style.display = 'block'
        document.querySelector('.marketing').style.display = 'block'

        document.querySelector('#question-category').textContent =
            question.category
        document.querySelector('#question-difficulty').textContent =
            question.difficulty
        document.querySelector('#question').innerHTML = question.text
        window.setTimeout(() => {
            this.revealAnswers()
        }, question.revealAnswersDelay)
    }

    revealAnswers() {
        let answerDivId = `#answer${this.question.correctIndex + 1}`
        document.querySelector(
            answerDivId
        ).innerHTML = this.question.correctAnswer
        this.question.incorrectAnswers.forEach((incorrectAnswer, i) => {
            answerDivId = `#answer${this.question.incorrectIndex[i] + 1}`
            document.querySelector(answerDivId).innerHTML = incorrectAnswer
        })

        // track when started
        this.startTime = Date.now()

        // set up timer to remove incorrect answers
        const answersTimerId = window.setInterval(() => {
            this.eliminateAnswer()
        }, this.question.answerTime / 3)
        this.answersTimerId = answersTimerId

        // set up timer
        this.timeLeft = this.question.answerTime / 1000
        document.querySelector('#time').textContent = this.timeLeft
        const timerId = window.setInterval(() => {
            this.updateTimer()
        }, 1000)
        this.timerId = timerId

        // set up decreasing score
        const scoreTimerId = window.setInterval(() => {
            this.updateScore()
        }, SCORE_REFRESH_INTERVAL)
        this.scoreTimerId = scoreTimerId

        this.setUpAnswerClickListeners()
    }

    eliminateAnswer() {
        const removedAnswerIndex = this.question.incorrectIndex.pop()

        let answerDivId = `#answer${removedAnswerIndex + 1}`
        const answerDiv = document.querySelector(answerDivId)
        if (answerDiv.className === 'answer') {
            answerDiv.className = 'answer-disabled'
        } else {
            // selected answer, indicate wrong and set score to zero
            answerDiv.className = 'answer-wrong'
            this.question.score = 0
            document.querySelector('#score').textContent = 0
            window.clearInterval(this.scoreTimerId)
        }

        if (this.question.incorrectIndex.length === 0) {
            answerDivId = `#answer${this.question.correctIndex + 1}`
            document.querySelector(answerDivId).className = 'answer-correct'
            window.clearInterval(this.answersTimerId)
        }
    }

    updateTimer() {
        this.timeLeft--
        document.querySelector('#time').textContent = this.timeLeft
        if (this.timeLeft === 0) {
            window.clearInterval(this.timerId)
        }
    }

    updateScore() {
        const scoreRemaining = this.getScoreRemaining()
        document.querySelector('#score').textContent = scoreRemaining

        if (scoreRemaining === 0) {
            window.clearInterval(this.scoreTimerId)
        }
    }

    setUpAnswerClickListeners() {
        // iterate over answer divs

        const answerDivs = document.getElementsByClassName('answer')
        Array.prototype.forEach.call(answerDivs, answerDiv => {
            answerDiv.addEventListener(
                'click',
                e => this.answerClicked(e),
                false
            )
        })
    }

    answerClicked(event) {
        if (this.selectedIndex >= 0) return

        const target = event.currentTarget

        target.className = 'answer-selected'
        const id = target.id
        const selectedIndex = parseInt(id.slice(-1))
        this.selectedIndex = selectedIndex

        // calculate and freeze score
        const score = this.getScoreRemaining()
        this.question.score = score
        document.querySelector('#score').textContent = score
        window.clearInterval(this.scoreTimerId)
    }

    getScoreRemaining() {
        const elapsedTime = Date.now() - this.startTime
        const scoreRemaining = parseInt(
            INITIAL_SCORE *
                ((this.question.answerTime - elapsedTime) /
                    this.question.answerTime)
        )

        return scoreRemaining
    }
}
