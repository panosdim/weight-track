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
$height = json_decode(file_get_contents('php://input'));
$height = filter_var($height, FILTER_SANITIZE_NUMBER_INT);

// Update height of the user
$stmt = $db->prepare(
    'UPDATE `users` SET `height` = (?) WHERE `id` = (?) '
);

if ($stmt->execute([$height, $_SESSION['userId']])) {
    echo json_encode([
        "status" => "success",
        "message" => "User height was updated successfully.",
        "bmi" => calculateBMI()
    ]);
} else {
    // DB interaction was not successful. Inform user with message.
    echo json_encode([
        "status" => "error",
        "message" => "Problem executing statement in DB. Try again later."
    ]);
}
