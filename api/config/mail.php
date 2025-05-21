<?php
// Load environment variables from .env file if not already loaded
if (!getenv('SMTP_HOST')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
}

$config = [
    'smtp_host' => getenv('SMTP_HOST') ?: 'smtp.hostinger.com',
    'smtp_port' => getenv('SMTP_PORT') ?: 465,
    'smtp_username' => getenv('SMTP_USERNAME') ?: 'no-reply@kolkatachessacademy.in',
    'smtp_password' => getenv('SMTP_PASSWORD'),
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
