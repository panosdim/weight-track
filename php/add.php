<?php

session_start();
// If not Login exit
if (!isset($_SESSION['userId'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'You are not logged in.'
    ]);
    exit();
}

require_once 'database.php';
require_once 'BMI.php';

// Define variables and set to empty values
$date = $weight = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $date = filter_input(INPUT_POST, "date", FILTER_SANITIZE_STRING);
    $weight = filter_input(INPUT_POST, "weight", FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
}

// Insert measurement in the table
$stmt = $db->prepare(
    'INSERT INTO `measurements` (`user_id`, `date`, `weight`) VALUES (?, ?, ?)'
);

if ($stmt->execute([$_SESSION['userId'], $date, $weight])) {
    echo json_encode([
        "status" => "success",
        "message" => "Measure was added successfully.",
        "bmi" => calculateBMI()
    ]);
} else {
    // DB interaction was not successful. Inform user with message.
    echo json_encode([
        "status" => "error",
        "message" => "Problem executing statement in DB. Try again later."
    ]);
}