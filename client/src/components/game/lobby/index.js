import React from 'react'
import './index.css'

export default function Lobby({ gameId, players, launchGame, isAdmin }) {
    const playersListItems = players.map(player => <li key={player}>{player}</li>)
    return (
        <main className="lobby">
            {isAdmin &&
            <ol>
                <li>Navigate to: <span className="large">{window.location.host}</span></li>
                <li>Enter the following party key: <span className="large">{gameId}</span></li>
            </ol>
            }
            <h1>{players.length} PARTY {players.length !== 1 ? 'PEOPLE' : 'PERSON'} IN THE HOUSE</h1>
            <ul>
                {playersListItems.length > 0 ? playersListItems : '\u00A0'}
            </ul>
            {isAdmin && <p><button onClick={launchGame} id="launch-button">Launch Game</button></p>}
        </main>
    )
}


