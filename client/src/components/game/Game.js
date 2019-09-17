import React, { Component } from 'react';
import { ADMIN_WAITING, JOIN, JOIN_ERROR, PLAYER_WAITING, LAUNCH_GAME, DISPLAY_QUESTION, SEND_SCORE, SCOREBOARD} from './actions'
import { WAITING_TO_JOIN, IN_LOBBY, DISPLAYING_QUESTION } from './status'
import Join from './join/Join'
import Lobby from './lobby/Lobby'
import Question from './question/Question'

const ADMIN_SCOREBOARD_DELAY = 2000

class Game extends Component {
  
  state = {
    status: '',
    gameId: '',
    displayName: '',
    score: 0,
    numQuestions: 0,
    numQuestionsAnswered: 0,
    players: [],
    currentQuestion: null,
    isAdmin: false
  }

  constructor() {
    super()
    this.joinGame = this.joinGame.bind(this)
    this.launchGame = this.launchGame.bind(this)
    this.sendScore = this.sendScore.bind(this)
  }

  componentDidMount() {
    // set up web socket connection
    // proxy in package.json not working for web sockets, remove port replace before deployment
    const HOST = window.location.origin.replace(/^http/, 'ws').replace(/3000/, '5000')
    
    const ws = new WebSocket(HOST)
    //const controller = new Controller(ws)

    const params = new URLSearchParams(window.location.search)
    const gameId = params.get('admin')
    ws.onopen = () => {
        console.log('ws connection to game server open')

        if (gameId) {
            // inform server this is the admin client
            const data = {
                type: 'admin',
                action: ADMIN_WAITING,
                game: gameId
            }
            ws.send(JSON.stringify(data))

            this.setState(_ => (
              {status: IN_LOBBY, gameId, isAdmin: true}
            ))
        }
        else {
          this.setState(_ => (
            {status: WAITING_TO_JOIN}
          ))
      }
    }
    
    ws.onmessage = message => {
      this.receiveMessage(message)
    }

    ws.onclose = () => {
        console.log('ws connection to game server closed')
    }

    this.ws = ws
  }

  joinGame(game, display) {
    const data = {
      action: JOIN,
      game,
      display
    }
    this.ws.send(JSON.stringify(data))
  }

  launchGame() {
    const data = {
      action: LAUNCH_GAME,
      game: this.state.gameId
    }
    this.ws.send(JSON.stringify(data))
  }

  sendScore(score) {
    console.log(score);
    
    // if (!this.isAdmin) {
    //   // send score to server
    //   const data = {
    //       action: ACTIONS.score,
    //       game: this.game,
    //       score: this.question.score,
    //       display: this.display
    //   }
    //   this.ws.send(JSON.stringify(data))
    // } else {
    //     // initiate scoreboard update
    //     // (small delay to ensure all clients have time to submit scores)
    //     setTimeout(() => {
    //         const adminData = {
    //             action: ACTIONS.scoreboard,
    //             game: this.game
    //         }
    //         this.ws.send(JSON.stringify(adminData))
    //     }, ADMIN_SCOREBOARD_DELAY)
    // }
  }

  receiveMessage(message) {
    const data = JSON.parse(message.data)
    console.log('Message received', data)

    switch (data.action) {
      case JOIN_ERROR:
        alert(data.message)
        break
      case ADMIN_WAITING:
        this.setState(_ => (
          {
            status: IN_LOBBY,
            gameId: data.game,
            players: data.players,
            isAdmin: true
          }
        ))
        break
      case PLAYER_WAITING:
          this.setState(_ => (
            {
              status: IN_LOBBY,
              gameId: data.game,
              players: data.players,
              isAdmin: false
            }
          ))
          break
      case DISPLAY_QUESTION:
          this.setState(_ => (
            {
              status: DISPLAYING_QUESTION,
              currentQuestion: data.question
            }
          ))

        break
      default:
          alert('An error occurred')
          console.error('Invalid message action received', message)
}
  }
  render() {
    return (
      <>
        {this.state.status === WAITING_TO_JOIN && <Join joinGame={this.joinGame} />}
        {this.state.status === IN_LOBBY &&
          <Lobby
            gameId={this.state.gameId}
            players={this.state.players}
            isAdmin={this.state.isAdmin} 
            launchGame={this.launchGame}
          />
        }
        {this.state.status === DISPLAYING_QUESTION &&
          <Question
            question={this.state.currentQuestion}
            isAdmin={this.state.isAdmin}
            sendScore={this.sendScore}
          />
        }
      </>
    )
  }
}
export default Game;
