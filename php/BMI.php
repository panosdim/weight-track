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

// If not Login exit
if (!isset($_SESSION['userId'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'You are not logged in.'
    ]);
    exit();
}

require_once 'database.php';

/**
 * Calculates the current BMI of the user.
 * @return float|int The calculated BMI or -1 in case of error.
 */
function calculateBMI()
{
    global $db;

    // Find the user height
    $stmt = $db->prepare(
        'SELECT height FROM users WHERE id = ? LIMIT 1'
    );

    if ($stmt->execute([$_SESSION['userId']])) {
        $height = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($height == false) {
            // No height found for user.
           return -1;
        }
    } else {
        // DB interaction was not successful. Inform user with message.
        return -1;
    }

    // Find the last weight measure of the specific user id
    $stmt = $db->prepare(
        'SELECT weight FROM measurements WHERE user_id = ? ORDER BY date DESC LIMIT 1'
    );

    if ($stmt->execute([$_SESSION['userId']])) {
        $weight = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($weight == false) {
            // No weight found for user.
            return -1;
        }
    } else {
        // DB interaction was not successful. Inform user with message.
        return -1;
    }

    if ($weight !== null && $height !== null) {
        $height = intval($height['height']) / 100;
        $weight = floatval($weight['weight']);
    } else {
        // No BMI can be calculated for the user.
       return -1;
    }

    // Calculate BMI
    $bmi = $weight / pow($height, 2);

    return round($bmi, 1);
}
