import React, { Component } from 'react';
import { ADMIN_WAITING } from './actions'
import { JOIN } from './status'
import Join from './join/Join'
import './Game.css'

class Game extends Component {
  
  state = {
    status: JOIN,
    gameId: '',
    displayName: '',
    score: 0,
    numQuestions: 0,
    numQuestionsAnswered: 0,
    currentQuestion: null

  }

  componentDidMount() {
    // set up web socket connection
    const HOST = window.location.origin.replace(/^http/, 'ws').replace(/3000/, '5000')
    console.log(HOST);
    
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
      console.log('message received', message)
    }

    ws.onclose = () => {
        console.log('ws connection to game server closed')
    }

    this.ws = ws
  }

  render() {
    return (
      <>
        {this.state.status === JOIN && <Join />}
      </>
    )
  }
}
export default Game;
