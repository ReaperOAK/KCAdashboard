<?php
// Production-safe: Only use getenv(), do not require .env file

$config = [
    'smtp_host' => getenv('SMTP_HOST') ?: 'smtp.hostinger.com',
    'smtp_port' => getenv('SMTP_PORT') ?: 465,
    'smtp_username' => getenv('SMTP_USERNAME') ?: 'admin@kolkatachessacademy.in',
    'smtp_password' => getenv('SMTP_PASSWORD') ?: 'admin123@KCA',
    'from_email' => getenv('MAIL_FROM_ADDRESS') ?: 'no-reply@kolkatachessacademy.in',
    'from_name' => getenv('MAIL_FROM_NAME') ?: 'Kolkata Chess Academy',
    'smtp_secure' => getenv('SMTP_SECURE') ?: 'ssl'
];

// Validate config
foreach ($config as $key => $value) {
    if (empty($value) && $key === 'smtp_password') {
        error_log("ERROR: SMTP password not configured!");
        throw new Exception("Mail configuration error: SMTP password is required");
    }
}

return $config;
?>
