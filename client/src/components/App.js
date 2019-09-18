import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Game from './game'
import './App.css'
import Logo from './mtp-logo-100.png'

class App extends Component {
  
  render() {
    return (
      <>
      <header>
        <img src={Logo} alt="Mega Trivia Party Logo" />
        <span className="title">Mega Trivia Party</span>
        <span className="shout-out">powered by<br /><a href="https://opentdb.com">Open Trivia Database</a></span>
      </header>
      <main>
      <Router>
        <Route exact path="/" component={Game} />
        <Route path="/index.html" component={Game} />
      </Router>
      </main>
      </>
    )
  }
}
export default App;
