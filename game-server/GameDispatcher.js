// singleton

const { Game, JOIN_ERROR } = require('./Game')

class GameDispatcher {
    constructor() {
        this.games = {}
        this.removeGame = this.removeGame.bind(this)
    }

    createNewGame(config) {
        const game = new Game(config, this.removeGame)
        this.games[game.id] = game
        return game
    }

    removeGame(id) {
        console.log('Removing game: ' + id)

        delete this.games[id]
    }

    dispatchMessage(message, ws) {
        console.log('Message received', message)

        const id = message.game
        const game = this.games[id]

        if (game) {
            game.receiveMessage(message, ws)
        } else {
            const errorData = {
                action: JOIN_ERROR,
                message: `Game with id ${id} not found`
            }
            ws.send(JSON.stringify(errorData))
        }
    }
}

const gameDispatcher = new GameDispatcher()
Object.freeze(gameDispatcher)

module.exports = gameDispatcher
