//import Controller from './Controller'

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
        console.log('Message received', message)
        controller.processMessage(message)
    }

    if (gameId) {
        // admin
        setUpAdminLaunch(ws, gameId)
    } else {
        // player join string
        addJoinFormListener(ws)
    }
})

const addJoinFormListener = ws => {
    document.querySelector('.lobby-display').style.display = 'block'
    document
        .querySelector('#join-form')
        .addEventListener('submit', function(event) {
            event.preventDefault()
            const game = this.querySelector('#game-id').value.trim()
            const display = this.querySelector('#display-name').value.trim()
            // TODO validate

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
