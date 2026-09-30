<?php
include "db.php";

$username = $_POST['username'];
$score = $_POST['score'];

// Insert the score
$sql = "INSERT INTO leaderboard (username, score, highscore)
        VALUES ('$username', $score, $score)";

if ($conn->query($sql) === TRUE) {
    echo "Score saved";
} else {
    echo "Error: " . $conn->error;
}
?>
