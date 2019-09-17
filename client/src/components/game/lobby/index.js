import React from 'react'

export default function Lobby({ gameId, players, launchGame, isAdmin }) {
    const playersListItems = players.map(player => <li key={player}>{player}</li>)
    return (
            <div className="jumbotron admin-lobby-display">
                <p className="game-id-display">GAME KEY: {gameId}</p>
                <h2>{players.length} PARTIER{players.length !== 1 ? 'S' : ''}</h2>
                <ul className="lobby-players">
                    {playersListItems}
                </ul>
                {isAdmin && <p><button onClick={launchGame} id="launch-button">Launch Game</button></p>}
            </div>
    )
}


