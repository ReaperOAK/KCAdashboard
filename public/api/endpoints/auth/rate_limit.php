<?php
// Simple file-based rate limiter for login attempts per IP
// Usage: include and call rate_limit_check($ip, $action)

function rate_limit_check($ip, $action, $limit = 5, $window = 300) {
    $dir = sys_get_temp_dir() . '/kca_rate_limit';
    if (!file_exists($dir)) {
        mkdir($dir, 0700, true);
    }
    $file = "$dir/{$action}_" . md5($ip);
    $now = time();
    $attempts = [];
    if (file_exists($file)) {
        $attempts = json_decode(file_get_contents($file), true) ?: [];
        // Remove old attempts
        $attempts = array_filter($attempts, function($t) use ($now, $window) {
            return $t > $now - $window;
        });
    }
    $attempts[] = $now;
    file_put_contents($file, json_encode($attempts));
    if (count($attempts) > $limit) {
        return false;
    }
    return true;
}
?>
