<?php

/*
 * Copyright (C) 2015 padi
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

session_start();

//TODO: Update with new PDO functions
require_once 'db_connection.php';

echo json_encode(
    array(
        "status" => "error",
        "msg_title" => "Registration is close for now.",
        "msg_info" => "Please try again later."
    ));
exit();

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

// Define variables and set to empty values
$email = $password = $first_name = $last_name = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = filter_input(INPUT_POST, "email", FILTER_SANITIZE_EMAIL);
    $password = filter_input(INPUT_POST, "password", FILTER_SANITIZE_STRING);
    $first_name = filter_input(INPUT_POST, "first_name", FILTER_SANITIZE_STRING);
    $last_name = filter_input(INPUT_POST, "last_name", FILTER_SANITIZE_STRING);
}

// Check if user already exists
if ($fpdo->from('users')
        ->select(NULL)
        ->select('email')
        ->where('email =  ?', $email)
        ->fetch() !== false
) {
    // Inform user that registration was not successful as user already exists.
    echo json_encode(
        array(
            "status" => "error",
            "msg_title" => "Registration was not successful.",
            "msg_info" => "User with same email already exists."
        ));

    exit();
}

// Insert user in the table
$values = array(
    'email' => $email,
    'password' => create_hash($password),
    'first_name' => $first_name,
    'last_name' => $last_name
);

if ($fpdo->insertInto('users', $values)->execute() === false) {
    echo json_encode(
        array(
            "status" => "error",
            "msg_title" => "Registration was not successful.",
            "msg_info" => "Insertion to database failed. Please try again."
        ));
} else {
    echo json_encode(
        array(
            "status" => "success",
            "msg_title" => "Registration was successful.",
            "msg_info" => "You can now proceed with login."
        ));
}