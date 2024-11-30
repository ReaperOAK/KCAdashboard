<?php
require 'vendor/autoload.php';
use \Firebase\JWT\JWT;

function jwt_decode($jwt, $key, $alg) {
    return JWT::decode($jwt, $key, array($alg));
}