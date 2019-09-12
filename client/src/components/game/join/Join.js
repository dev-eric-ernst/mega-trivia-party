import React, { Component } from 'react'

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
            <div>
                <form id="join-form" onSubmit={this.handleSubmit}>
                    <p>
                        <label htmlFor="game-id">Party Key: <input
                            type="text"
                            id="game-id"
                            placeholder="enter the game key"
                            required={true}
                            ref={this.keyRef}
                        />
                        </label
                        >
                    </p>
                    <p>
                        <label htmlFor="display-name">Display Name: <input
                            type="text"
                            id="display-name"
                            placeholder="enter a display name"
                            required={true}
                            ref={this.displayNameRef}
                        />
                        </label
                        >
                    </p>
                    <p><input type="submit" value="Crash this Party!" /></p>
                </form>
            </div>
        )
    }
}

export default Join
