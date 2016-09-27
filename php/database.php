<?php

// Connect to MySQL server
// TODO: Update with server settings
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_DSN', 'mysql:host=localhost;dbname=iamfit');

// Load EasyDB
$db = new PDO(
    DB_DSN,
    DB_USER,
    DB_PASS
);