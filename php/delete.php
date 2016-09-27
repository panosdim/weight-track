<?php

session_start();
// If not Logged In exit
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
$ids = json_decode(file_get_contents('php://input'));

foreach ($ids as &$id)
    $id = $db->quote($id); // filter elements for SQL injection

$ids = implode(',',$ids);

// Delete measurements from the table
$stmt = $db->prepare(
    "DELETE FROM `measurements` WHERE id IN ($ids)"
);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Measure(s) was deleted successfully.",
        "bmi" => calculateBMI()
    ]);
} else {
    // DB interaction was not successful. Inform user with message.
    echo json_encode([
        "status" => "error",
        "message" => "Problem executing statement in DB. Try again later."
    ]);
}