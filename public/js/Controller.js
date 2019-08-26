const SCORE_REFRESH_INTERVAL = 10
const INITIAL_SCORE = 10000
const ADMIN_SCOREBOARD_DELAY = 2000
const ADMIN_NEXT_QUESTION_DELAY = 5000
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
    score: 'score',
    scoreboard: 'scoreboard'
}
const CATEGORIES = {
    list: [11, 18, 19],
    map: {
        '11': 'Entertainment: Film',
        '18': 'Science: Computers',
        '19': 'Science: Mathematics'
    }
}

class Controller {
    constructor(ws) {
        this.ws = ws
        this.isAdmin = false
        this.game = ''
        this.display = ''
        this.selectedIndex = -1 // no answer selected
    }

    processMessage(message) {
        const data = JSON.parse(message.data)
        console.log('Message received', data)
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
            case ACTIONS.scoreboard:
                this.displayLeaderboard(data)
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
        document.querySelector('.leaderboard').style.display = 'none'
        document.querySelector('.header').style.display = 'block'
        document.querySelector('.question-display').style.display = 'block'
        document.querySelector('.marketing').style.display = 'block'

        // reset answers
        const answerNodes = document.querySelectorAll('.marketing p')
        answerNodes.forEach(node => {
            if (
                node.className !== 'time-display' &&
                node.className !== 'score-display'
            ) {
                node.innerHTML = ''
                node.className = 'answer'
            }
        })

        this.selectedIndex = -1 // reset selected answer

        document.querySelector('#score').textContent = ''
        document.querySelector('#time').textContent = ''

        document.querySelector('#question-category').textContent =
            CATEGORIES.map[question.category]
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
        if (!this.isAdmin) {
            const scoreTimerId = window.setInterval(() => {
                this.updateScore()
            }, SCORE_REFRESH_INTERVAL)
            this.scoreTimerId = scoreTimerId

            this.setUpAnswerClickListeners()
        }
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

            if (!this.isAdmin) {
                // send score to server
                const data = {
                    type: TYPES.player,
                    action: ACTIONS.score,
                    game: this.game,
                    score: this.question.score,
                    display: this.display
                }
                this.ws.send(JSON.stringify(data))
            } else {
                // initiate scoreboard update
                // (small delay to ensure all clients have time to submit scores)
                setTimeout(() => {
                    const adminData = {
                        type: TYPES.admin,
                        action: ACTIONS.scoreboard,
                        game: this.game
                    }
                    this.ws.send(JSON.stringify(adminData))
                }, ADMIN_SCOREBOARD_DELAY)
            }
        }
    }

    updateScore() {
        const scoreRemaining = this.getScoreRemaining()
        document.querySelector('#score').textContent = scoreRemaining

        if (scoreRemaining === 0) {
            this.question.score = 0
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

        return Math.max(scoreRemaining, 0)
    }

    displayLeaderboard(data) {
        // display progress
        document.querySelector(
            '.leaderboard h2'
        ).textContent = `After ${data.current} of ${data.total} questions...`

        // reduce player array to HTML (table rows)
        const board = data.scores
        const html = board.reduce(
            (accumulator, player) => {
                const rowHtml = `<tr><td>${accumulator.row}</td><td>${player.display}</td><td>${player.previousScore}</td><td>${player.score}</td></tr>`
                accumulator.str += rowHtml
                accumulator.row++
                return accumulator
            },
            { row: 1, str: '' }
        )

        document.querySelector('.leaderboard').style.display = 'block'
        document.querySelector('.header').style.display = 'none'
        document.querySelector('.question-display').style.display = 'none'
        document.querySelector('.marketing').style.display = 'none'
        document.querySelector('.leaderboard tbody').innerHTML = html.str

        // admin will request next question
        if (this.isAdmin) {
            const data = {
                type: TYPES.admin,
                action: ACTIONS.question,
                game: this.game
            }
            setTimeout(() => {
                this.ws.send(JSON.stringify(data))
            }, ADMIN_NEXT_QUESTION_DELAY)
        }
    }
}
