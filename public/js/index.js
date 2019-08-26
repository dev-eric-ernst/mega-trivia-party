document.addEventListener('DOMContentLoaded', event => {
    // set up web socket connection
    const HOST = location.origin.replace(/^http/, 'ws')
    const ws = new WebSocket(HOST)
    const controller = new Controller(ws)

    const params = new URLSearchParams(window.location.search)
    const gameId = params.get('admin')
    ws.onopen = () => {
        console.log('ws connection to game server open')

        if (gameId) {
            // inform server this is the admin client
            const data = {
                type: TYPES.admin,
                action: ACTIONS.adminWaiting,
                game: gameId
            }
            ws.send(JSON.stringify(data))
        }
    }

    ws.onmessage = message => {
        controller.processMessage(message)
    }

    ws.onclose = () => {
        console.log('ws connection to game server closed')
    }

    if (gameId) {
        // admin
        controller.isAdmin = true
        controller.game = gameId
        setUpAdminLaunch(ws, gameId)
    } else {
        // player join form
        addJoinFormListener(ws, controller)
        document.querySelector('.score-display').style.display = 'block'
    }
})

const addJoinFormListener = (ws, controller) => {
    document.querySelector('.lobby-display').style.display = 'block'
    document
        .querySelector('#join-form')
        .addEventListener('submit', function(event) {
            event.preventDefault()
            const game = this.querySelector('#game-id').value.trim()
            const display = this.querySelector('#display-name').value.trim()
            // TODO validate

            controller.display = display
            controller.game = game
            const data = {
                type: TYPES.player,
                action: ACTIONS.join,
                game,
                display
            }
            ws.send(JSON.stringify(data))
        })
}

const setUpAdminLaunch = (ws, gameId) => {
    document.querySelector('.admin-lobby-display').style.display = 'block'
    document.querySelector(
        '.game-id-display'
    ).innerHTML = `Game ID: <span>${gameId}</span>`
    document
        .querySelector('#launch-button')
        .addEventListener('click', event => {
            const data = {
                type: TYPES.admin,
                action: ACTIONS.launch,
                game: gameId
            }
            ws.send(JSON.stringify(data))
        })
}
