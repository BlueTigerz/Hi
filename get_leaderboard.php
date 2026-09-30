<?php
include "db.php";

$result = $conn->query("SELECT username, score, highscore FROM leaderboard ORDER BY score DESC LIMIT 20");

$rows = [];
while ($r = $result->fetch_assoc()) {
    $rows[] = $r;
}

echo json_encode($rows);
?>
