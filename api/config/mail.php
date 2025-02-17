<?php
$config = [
    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 465,
    'smtp_username' => 'noreply@kolkatachessacademy.in',
    'smtp_password' => 'Admin1234*',
    'from_email' => 'admin@kolkatachessacademy.in',
    'from_name' => 'Kolkata Chess Academy'
];

// Validate config
foreach ($config as $key => $value) {
    if (empty($value)) {
        error_log("Missing mail config: $key");
        throw new Exception("Invalid mail configuration");
    }
}

return $config;
?>
