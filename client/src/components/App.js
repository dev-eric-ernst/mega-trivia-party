import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Game from './game/Game'
import './App.css'

class App extends Component {
  
  render() {
    return (
      <Router>
        <Route exact path="/" component={Game} />
      </Router>
    )
  }
}
export default App;
