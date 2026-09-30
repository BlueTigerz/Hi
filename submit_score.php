<?php
include "db.php";

$username = $_POST['username'];
$score = $_POST['score'];

// Insert score + highscore (same value for now)
$stmt = $conn->prepare("INSERT INTO leaderboard (username, score, highscore) VALUES (?, ?, ?)");
$stmt->bind_param("sii", $username, $score, $score);
$stmt->execute();

echo "Score saved!";
?>
