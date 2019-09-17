import React from 'react'
import LeaderboardRow from './LeaderboardRow'

export default function Leaderboard({ scores, current, total }) {
        // reduce player array to HTML (table rows)
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
        <>
        <h2>After {current} of {total} questions...</h2>
        <table>
            <caption>
                LEADERBOARD
            </caption>
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
        </>
    )
}
