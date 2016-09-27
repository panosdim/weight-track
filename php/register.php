<?php

session_start();
require_once 'database.php';
require('autoload.php');

// Define Helper functions
define('ALGO', '$2a');
define('COST', '$10');

function unique_salt()
{
    return substr(sha1(mt_rand()), 0, 22);
}

function create_hash($password)
{
    return crypt($password, ALGO . COST . '$' . unique_salt());
}

$secret = '6LdoxAcUAAAAAIM3gSKuvy9V6mEfp74ZyuIRlvK0';
$recaptcha = new \ReCaptcha\ReCaptcha($secret);
$resp = $recaptcha->verify($_POST['g-recaptcha-response'], $_SERVER['REMOTE_ADDR']);
if ($resp->isSuccess()) {
    // Define variables and set to empty values
    $email = $password = $firstName = $lastName = "";
    $height = 0;

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $email = filter_input(INPUT_POST, "regEmail", FILTER_SANITIZE_EMAIL);
        $password = filter_input(INPUT_POST, "regPassword", FILTER_SANITIZE_STRING);
        $firstName = filter_input(INPUT_POST, "regFirstName", FILTER_SANITIZE_STRING);
        $lastName = filter_input(INPUT_POST, "regLastName", FILTER_SANITIZE_STRING);
        $height = filter_input(INPUT_POST, "regHeight", FILTER_SANITIZE_NUMBER_INT);
    }

    // Check if user already exists
    $stmt = $db->prepare(
        'SELECT email FROM users WHERE email = ?'
    );
    if ($stmt->execute([$email])) {
        $query = $stmt->fetch();

        if ($query == false) {
            // Insert user in the table
            $stmt = $db->prepare(
                'INSERT INTO `users` (`email`, `password`, `first_name`, `last_name`, `height`) VALUES (?, ?, ?, ?, ?)'
            );

            if ($stmt->execute([$email, create_hash($password), $firstName, $lastName, $height])) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Registration was successful. You can now proceed with login."
                ]);
            } else {
                // DB interaction was not successful. Inform user with message.
                echo json_encode([
                    "status" => "error",
                    "message" => "Problem executing statement in DB. Try again later."
                ]);
            }
        } else {
            // Registration was not successful. Inform user with message.
            echo json_encode([
                "status" => "error",
                "message" => "Registration was not successful. User with same email already exists."
            ]);
        }
    } else {
        // DB interaction was not successful. Inform user with message.
        echo json_encode([
            "status" => "error",
            "message" => "Problem executing statement in DB. Try again later."
        ]);
    }
} else {
    $errors = $resp->getErrorCodes();
    echo json_encode([
        "status" => "error",
        "message" => "Captcha verification failed",
        "error" => $errors
    ]);

    exit();
}