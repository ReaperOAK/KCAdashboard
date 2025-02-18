<?php
$config = [
    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 465,
    'smtp_username' => 'noreply@kolkatachessacademy.in',
    'smtp_password' => 'Admin1234*',
    'from_email' => 'noreply@kolkatachessacademy.in', // Changed to match smtp_username
    'from_name' => 'Kolkata Chess Academy'
];

// Validate config and log values (remove in production)
foreach ($config as $key => $value) {
    if (empty($value)) {
        error_log("Missing mail config: $key");
        throw new Exception("Invalid mail configuration: $key is empty");
    }
    error_log("Mail config $key: $value");
}

return $config;
?>
