export default function Leaderboard({ rows }) {
  return (
    <section className="leaderboard">
      <h2>Leaderboard</h2>
      {rows.length === 0 ? (
        <p>No scores yet. Be the first!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Score</th>
              <th>Highscore</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>{row.username}</td>
                <td>{row.score}</td>
                <td>{row.highscore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
