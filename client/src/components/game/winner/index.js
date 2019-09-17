import React from 'react'

export default function Winner({ winner, loser }) {
    return (
        <div>
            <p>Winner: {winner.display}</p>
            <p>Loser: {loser.display}</p>
         </div>
    )
}
