import React from 'react'

export default function LeaderboardRow({ rank, player, previousScore, score}) {
    return (
        <tr>
            <td>{rank}</td>
            <td>{player}</td>
            <td>{previousScore}</td>
            <td>{score}</td>
        </tr>
    )
}
