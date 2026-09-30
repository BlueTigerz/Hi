function sendScore(username, score) {
    fetch("http://localhost/tetris_server/submit_score.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "username=" + encodeURIComponent(username) +
              "&score=" + encodeURIComponent(score)
    })
    .then(response => response.text())
    .then(data => {
        console.log("Server says:", data);
        alert("Score submitted: " + data);
    })
    .catch(err => {
        console.error("Error sending score:", err);
        alert("Error sending score: " + err);
    });
}
