module.exports = class GameDispatcher {
    constructor() {
        this.games = {}
    }

    addGame(game) {
        this.games[game.id]
    }

    removeGame(id) {
        delete this.games[id]
    }

    dispatchMessage(message) {
        const id = message.id
        const game = this.games[id]
        if (game) {
            game.message(message)
        } else {
            throw Error(`Game with id ${id} not found`)
        }
    }
}
