const { ACTIONS } = require('./Game')

module.exports = class GameDispatcher {
    constructor() {
        this.games = {}
    }

    addGame(game) {
        this.games[game.id] = game
    }

    removeGame(id) {
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
                action: ACTIONS.joinError,
                message: `Game with id ${id} not found`
            }
            ws.send(JSON.stringify(errorData))
        }
    }
}
