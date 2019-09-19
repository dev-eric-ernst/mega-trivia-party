import React from 'react'
import './index.css'

export default function Winner({ winner, loser }) {
    return (
        <main className="winner">
            <div className="winner-label">Winner is...</div>
            <div className="winner-display">{winner.display}</div>
            <div className="loser">Last Place: <span className="loser-display">{loser.display}</span></div>
        </main>
    )
}
