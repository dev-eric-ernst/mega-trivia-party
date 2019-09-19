import React, { Component } from 'react'
import './index.css'

class Join extends Component {

    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.keyRef = React.createRef()
        this.displayNameRef = React.createRef()
    }

    handleSubmit(e) {
        e.preventDefault()

        const game = this.keyRef.current.value.trim()
        const display = this.displayNameRef.current.value.trim()

        this.props.joinGame(game, display)
    }

    render() {
        return (
            <main className="join">
            <h1>CRASH A PARTY</h1>
            <form id="join-form" onSubmit={this.handleSubmit}>
                <label htmlFor="game-id">Key:</label>
                <input
                    type="text"
                    id="game-id"
                    placeholder="enter the party key"
                    required={true}
                    ref={this.keyRef}
                />
                <label htmlFor="display-name">Name:</label>
                <input
                    type="text"
                    id="display-name"
                    placeholder="enter a display name"
                    required={true}
                    ref={this.displayNameRef}
                />
                    
                <input type="submit" value="Party!" />
            </form>
            </main>
        )
    }
}

export default Join
