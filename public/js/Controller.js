const SCORE_REFRESH_INTERVAL = 10
const INITIAL_SCORE = 10000

class Controller {
    setupQuestion(question) {
        this.question = question
        document.getElementById('question-category').textContent =
            question.category
        document.getElementById('question-difficulty').textContent =
            question.difficulty
        document.getElementById('question').textContent = question.question
        window.setTimeout(() => {
            this.revealAnswers()
        }, this.question.revealAnswersDelay)
    }

    revealAnswers() {
        let answerDivId = `answer${this.question.correctIndex + 1}`
        document.getElementById(
            answerDivId
        ).textContent = this.question.correct_answer
        this.question.incorrect_answers.forEach((incorrectAnswer, i) => {
            answerDivId = `answer${this.question.incorrectIndex[i] + 1}`
            document.getElementById(answerDivId).textContent = incorrectAnswer
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
        document.getElementById('time').textContent = this.timeLeft
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
        const getRandomInt = (min, max) => {
            min = Math.ceil(min)
            max = Math.floor(max)
            return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
        }
        const removeIndex = getRandomInt(0, this.question.incorrectIndex.length)
        const removedAnswerIndex = this.question.incorrectIndex.splice(
            removeIndex,
            1
        )[0]

        let answerDivId = `answer${removedAnswerIndex + 1}`
        const answerDiv = document.getElementById(answerDivId)
        if (answerDiv.className === 'answer') {
            answerDiv.className = 'answer-disabled'
        } else {
            // selected answer, indicate wrong and set score to zero
            answerDiv.className = 'answer-wrong'
            this.question.score = 0
            document.getElementById('score').textContent = 0
            window.clearInterval(this.scoreTimerId)
        }

        if (this.question.incorrectIndex.length === 0) {
            answerDivId = `answer${this.question.correctIndex + 1}`
            document.getElementById(answerDivId).className = 'answer-correct'
            window.clearInterval(this.answersTimerId)
        }
    }

    updateTimer() {
        this.timeLeft--
        document.getElementById('time').textContent = this.timeLeft
        if (this.timeLeft === 0) {
            window.clearInterval(this.timerId)
        }
    }

    updateScore() {
        const scoreRemaining = this.getScoreRemaining()
        document.getElementById('score').textContent = scoreRemaining

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
        document.getElementById('score').textContent = score
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
