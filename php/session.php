<?php
/**
 * Copyright (c) 2016 Panagiotis Dimopoulos - All Rights Reserved
 * Email: panosdim@gmail.com
 */

session_start();

$sess = [];
if (isset($_SESSION['userId'])) {
    $sess["loggedIn"] = true;
    $sess["userId"] = $_SESSION['userId'];
    $sess["email"] = $_SESSION['email'];
} else {
    $sess["loggedIn"] = false;
    $sess["userId"] = '';
    $sess["email"] = '';
}

echo json_encode($sess);