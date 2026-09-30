<?php
$host = "localhost";
$user = "root";
$pass = ""; // or your actual password
$dbname = "tetrisdb";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
