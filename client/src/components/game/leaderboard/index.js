import React from 'react'
import LeaderboardRow from './LeaderboardRow'
import './index.css'

export default function Leaderboard({ scores, current, total }) {
    const rows = scores.map((entry, i) => (
        <LeaderboardRow
            rank={i + 1}
            player={entry.display}
            previousScore={entry.previousScore}
            score={entry.score}
            key={entry.display}
        />
    ))
    return (
        <main class="leaderboard">
        <h1><span className="wide-text">After </span>{current} of {total}<span className="wide-text"> Questions</span></h1>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Last Question</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
        </main>
    )
}
