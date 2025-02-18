<?php
$config = [
    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 465,
    'smtp_username' => 'admin@kolkatachessacademy.in',  // Changed from noreply to no-reply
    'smtp_password' => 'Admin1234*',  // Replace with actual password
    'from_email' => 'no-reply@kolkatachessacademy.in',
    'from_name' => 'Kolkata Chess Academy',
    'smtp_secure' => 'ssl'  // Added explicit SSL setting
];

// Validate config
foreach ($config as $key => $value) {
    if (empty($value)) {
        error_log("Missing mail config: $key");
        throw new Exception("Invalid mail configuration: $key is empty");
    }
}

return $config;
?>
