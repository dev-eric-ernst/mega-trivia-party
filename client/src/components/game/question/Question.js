import React, { Component } from 'react'

const INITIAL = 0
const ACTIVE = 1
// const COMPLETE = 2
const INITIAL_SCORE = 10000
// const SCORE_REFRESH_INTERVAL = 10

export default class Question extends Component {

    state = {
        status: INITIAL,
        currentScore: INITIAL_SCORE,
        playerScore: 0,
        displayedAnswers: [0,1,2,3],
        selectedAnswer: -1,
        secondsLeft: 0,
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
        this.setState((state, props) => ({
            status: ACTIVE,
            secondsLeft: props.question.answerTime / 1000
        }))
    }

    answerClick(index) {
        console.log('PLEASE ' + index)
    }

    // helper function to get answer text
    displayAnswer(index) {
        if (this.state.displayedAnswers.indexOf(index) < 0) {
            return ''
        }

        const {question} = this.props
        if (index === question.correctIndex) {
            return decodeHtml(question.correctAnswer)
        }

        // find matching incorrect answer
        const incorrectIndex = question.incorrectIndex.indexOf(index)        
        
        return decodeHtml(question.incorrectAnswers[incorrectIndex])
    }

    render() {
        const {question} = this.props

        return (
            <>
            <div className="header clearfix">
                <span className="text-muted">{question.category}</span>
                <span className="text-muted pull-right">
                    Difficulty:
                    <span
                    className="question-difficulty"
                    >{question.difficulty}</span>
                </span>
            </div>

            <div className="jumbotron question-display">
                <p className="question">{decodeHtml(question.text)}</p>
            </div>
            
            <div className="row marketing">
                <div className="col-lg-6">
                    {this.state.status !== INITIAL
                    && <p 
                        className="answer"
                        onClick={() => { this.answerClick(0)}}
                    >{this.displayAnswer(0)}</p>
                    }
                </div>
                <div className="col-lg-6">
                    {this.state.status !== INITIAL
                    && <p 
                        className="answer"
                        onClick={() => { this.answerClick(1)}}
                    >{this.displayAnswer(1)}</p>
                    }
                </div>
           </div>

            <div className="row marketing">
            <div className="col-lg-6">
                    {this.state.status !== INITIAL
                    && <p 
                        className="answer"
                        onClick={() => { this.answerClick(2)}}
                    >{this.displayAnswer(2)}</p>
                    }
                </div>
                <div className="col-lg-6">
                    {this.state.status !== INITIAL
                    && <p 
                        className="answer"
                        onClick={() => { this.answerClick(3)}}
                    >{this.displayAnswer(3)}</p>
                    }
                </div>
            </div>
            <div className="row marketing">
                <div className="col-lg-6">
                    <p className="time-display" id="time-left">
                        TIME&nbsp;<span id="time" className="time-left">
                            {this.state.status !== INITIAL && this.state.secondsLeft}</span>
                    </p>
                </div>
                <div className="col-lg-6">
                    <p className="score-display">
                        SCORE&nbsp;<span id="score" className="time-left"></span>
                    </p>
                </div>
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