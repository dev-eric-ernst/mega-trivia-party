import React, { Component } from 'react'
import './Question.css'

const INITIAL = 0
const ACTIVE = 1
const COMPLETE = 2
const INITIAL_SCORE = 10000
// const SCORE_REFRESH_INTERVAL = 10

export default class Question extends Component {

    state = {
        status: INITIAL,
        scoreDisplay: INITIAL_SCORE,
        incorrectAnswersIndex: [...this.props.question.incorrectIndex],
        selectedAnswer: -1,
        secondsLeft: this.props.question.answerTime / 1000,
    }

    componentDidMount() {
        // set up reveal answers timeout
        const {question} = this.props
        window.setTimeout(() => {this.revealAnswers()}, question.revealAnswersDelay)
    }

    revealAnswers() {

        // set up timer
        const timerId = window.setInterval(() => {
            if (this.state.secondsLeft > 0) {
                this.setState(state => ({secondsLeft: state.secondsLeft - 1}))
            }
            else {
                window.clearInterval(timerId)
            }
        }, 1000)

        // set up score display
        const scoreTimerId = window.setInterval(() => {
            const newScore = Math.max(this.getScoreRemaining(), 0)
            if (this.state.selectedAnswer < 0) {
                this.setState(_ => ({scoreDisplay: newScore}))
            }

            if (newScore === 0) {
                window.clearInterval(scoreTimerId)
            }

        })

        const {question} = this.props
        const answersTimerId = window.setInterval(() => {
            const numIncorrectAnswersDisplayed = this.state.incorrectAnswersIndex.length
            if (numIncorrectAnswersDisplayed > 1) {
                // remove incorrect answer
                const newIncorrectAnswersIndex = [...this.state.incorrectAnswersIndex]
                const answerIndexToRemove = newIncorrectAnswersIndex.pop()
                const selectedAnswer = this.state.selectedAnswer === answerIndexToRemove
                ? -1 : this.state.selectedAnswer

                this.setState(_ => ({incorrectAnswersIndex: newIncorrectAnswersIndex, selectedAnswer}))
            }
            else {
                window.clearInterval(answersTimerId)

                // TODO handle question complete
                this.setState(_ => ({
                    status: COMPLETE
                }))
            }
        }, question.answerTime / 3)

        // track when started
        this.startTime = Date.now()

        this.setState(_ => ({
            status: ACTIVE
        }))
    }

    answerClick(index) {
        if (this.state.status !== ACTIVE) {
            return
        }

        const { question, isAdmin } = this.props
        if (isAdmin) {
            return
        }

        if (index === question.correctIndex || this.state.incorrectAnswersIndex.indexOf(index) >= 0) {
            this.setState(_ => ({
                selectedAnswer: index
            }))    
        }
        else {
            // clicked on eliminated answer
        }
    }

    // helper function to get answer text
    displayAnswer(index) {
        const {question} = this.props
        if (index === question.correctIndex) {
            return decodeHtml(question.correctAnswer)
        }

        // find matching incorrect answer
        const incorrectIndex = question.incorrectIndex.indexOf(index)        
        
        return decodeHtml(question.incorrectAnswers[incorrectIndex])
    }

    getAnswerClassName(index) {
        const { question, isAdmin } = this.props
        const { status, selectedAnswer, incorrectAnswersIndex } = this.state

        if (status === INITIAL) {
            return 'hidden'
        }
        if (status === ACTIVE) {
            if (index === selectedAnswer) {
                return 'selected'
            }
            if (index === question.correctIndex || incorrectAnswersIndex.indexOf(index) >= 0) {
                return 'active'
            }

            return 'eliminated'
        }

        // COMPLETE status, countdown complete
        if (isAdmin) {
            return index === question.correctIndex ? 'correct' : 'eliminated'
        }

        if (index === question.correctIndex) {
            return index === selectedAnswer ? 'correct' : 'selected'
        }
        else {
            return index === selectedAnswer ? 'incorrect' : 'eliminated'
        }

    }
    getScoreRemaining() {
        const {question} = this.props
        const elapsedTime = Date.now() - this.startTime
        const scoreRemaining = parseInt(
            INITIAL_SCORE *
                ((question.answerTime - elapsedTime) /
                    question.answerTime)
        )

        return Math.max(scoreRemaining, 0)
    }

    render() {
        const {question} = this.props

        return (
            <>
            <div>
                <span>{question.category}</span>
                <span>
                    Difficulty:
                    <span
                    className="question-difficulty"
                    >{question.difficulty}</span>
                </span>
            </div>

            <div>
                <p className="question">{decodeHtml(question.text)}</p>
            </div>
            
            <div className="answer-container">
                <button 
                    className={`answer ${this.getAnswerClassName(0)}`}
                    onClick={() => { this.answerClick(0)}}
                >{this.displayAnswer(0)}</button>
                
                <button 
                    className={`answer ${this.getAnswerClassName(1)}`}
                    onClick={() => { this.answerClick(1)}}
                >{this.displayAnswer(1)}</button>
                <button 
                    className={`answer ${this.getAnswerClassName(2)}`}
                    onClick={() => { this.answerClick(2)}}
                >{this.displayAnswer(2)}</button>
                
                <button 
                    className={`answer ${this.getAnswerClassName(3)}`}
                    onClick={() => { this.answerClick(3)}}
                >{this.displayAnswer(3)}</button>
            </div>
            <div>
                <div>
                    <p className="time-display" id="time-left">
                        TIME&nbsp;<span id="time" className="time-left">
                            {this.state.secondsLeft}</span>
                    </p>
                </div>
                {!this.props.isAdmin &&
                <div>
                    <p className="score-display">
                        SCORE&nbsp;<span id="score" className="time-left">{this.state.scoreDisplay}</span>
                    </p>
                </div>
                }
            </div>
            </>
        )
    }
}

// hack to decode HTML entities
// https://stackoverflow.com/
// questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it
const decodeHtml = html => {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}