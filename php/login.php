<?php

/**
 * Copyright (c) 2016 Panagiotis Dimopoulos - All Rights Reserved
 * Email: panosdim@gmail.com
 */

session_start();
require_once 'database.php';

// Define variables and set to empty values
$email = $password = "";

// Define Helper functions
function check_password($hash, $password)
{
    $full_salt = substr($hash, 0, 29);
    $new_hash = crypt($password, $full_salt);
    return ($hash == $new_hash);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = filter_input(INPUT_POST, "email", FILTER_SANITIZE_EMAIL);
    $password = filter_input(INPUT_POST, "password", FILTER_SANITIZE_STRING);
}

// Get hashed password for user
$stmt = $db->prepare(
    'SELECT * FROM users WHERE email = ?'
);
if ($stmt->execute([$email])) {
    $query = $stmt->fetch();

    if ($query !== false) {
        // Hashing the DB password with the salt returns the same hash
        if (check_password($query['password'], $password)) {
            // Authentication successful - Set session
            echo json_encode([
                "status" => "success",
                "message" => "Login was successful."
            ]);
            $_SESSION['userId'] = $query['id'];
            $_SESSION['email'] = $email;
        } else {
            // Authentication was not successful. Inform user with message.
            echo json_encode([
                "status" => "error",
                "message" => "Login was not successful."
            ]);
        }
    } else {
        // Authentication was not successful. Inform user with message.
        echo json_encode([
            "status" => "error",
            "message" => "Login was not successful."
        ]);
    }
} else {
    // DB interaction was not successful. Inform user with message.
    echo json_encode([
        "status" => "error",
        "message" => "Problem executing statement in DB. Try again later."
    ]);
}


