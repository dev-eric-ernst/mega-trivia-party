import React, { Component } from 'react';
import { ADMIN_WAITING, JOIN, JOIN_ERROR } from './actions'
import { WAITING_TO_JOIN } from './status'
import Join from './join/Join'
import './Game.css'

class Game extends Component {
  
  state = {
    status: WAITING_TO_JOIN,
    gameId: '',
    displayName: '',
    score: 0,
    numQuestions: 0,
    numQuestionsAnswered: 0,
    currentQuestion: null

  }

  constructor() {
    super()
    this.joinGame = this.joinGame.bind(this)
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

  receiveMessage(message) {
    const data = JSON.parse(message.data)
    console.log('Message received', data)

    switch (data.action) {
      case JOIN_ERROR:
        alert(data.message)
        break
      default:
          alert('An error occurred')
          console.error('Invalid message action received', message)
}
  }
  render() {
    return (
      <>
        {this.state.status === JOIN && <Join joinGame={this.joinGame} />}
      </>
    )
  }
}
export default Game;
