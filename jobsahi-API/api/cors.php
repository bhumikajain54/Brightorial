<?php 
error_reporting(E_ALL);
ini_set('display_errors', 0);

// $BASE_DIR = dirname(__DIR__);
// require_once $BASE_DIR . "/vendor/autoload.php";

header('Content-Type: application/json');

// Allow specific prod origins
$strictAllowed = [
  'https://beige-jaguar-560051.hostingersite.com',
];
$strictAllowed[] = 'http://localhost';
$strictAllowed[] = 'http://127.0.0.1';
$strictAllowed[] = 'https://localhost';
$strictAllowed[] = 'https://127.0.0.1';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// If Origin header is missing, try to extract it from Referer (useful for some dev environments)
if (empty($origin) && !empty($_SERVER['HTTP_REFERER'])) {
    $parsed_url = parse_url($_SERVER['HTTP_REFERER']);
    if (isset($parsed_url['scheme']) && isset($parsed_url['host'])) {
        $origin = $parsed_url['scheme'] . '://' . $parsed_url['host'];
        if (isset($parsed_url['port'])) {
            $origin .= ':' . $parsed_url['port'];
        }
    }
}

$allow = false;

// Allow any localhost / 127.0.0.1 (any port) for dev
if (preg_match('#^https?://localhost(:\d+)?#', $origin)) {
  $allow = true;
} elseif (preg_match('#^https?://127\.0\.0\.1(:\d+)?#', $origin)) {
  $allow = true;
} elseif (in_array($origin, $strictAllowed, true)) {
  $allow = true;
}

// Additional check: if origin contains localhost or 127.0.0.1, allow it (for development)
// This catches any localhost variations including ports like :54017, :5173, etc.
if (!$allow && (stripos($origin, 'localhost') !== false || stripos($origin, '127.0.0.1') !== false)) {
  $allow = true;
}

// For development: if no origin header, allow (some browsers/clients don't send it)
if (!$allow && empty($origin)) {
  $allow = true;
  $origin = '*'; // Use wildcard if no origin
}

// Set CORS headers
if ($allow && !empty($origin) && $origin !== '*') {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin");
} else {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Credentials: false");
}

// Dynamically allow requested headers
if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
    header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
} else {
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers");
}
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Max-Age: 86400"); // cache preflight 24h
header("Access-Control-Expose-Headers: Content-Length, X-JSON"); // Expose additional headers

// Additional security headers
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");

// Handle CORS preflight (OPTIONS) requests FIRST, before any other processing
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Fix for Apache not passing Authorization header to PHP
// Some Apache configurations strip the Authorization header
if (!isset($_SERVER['HTTP_AUTHORIZATION']) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}

// Alternative: Try to get from getallheaders if available
if (!isset($_SERVER['HTTP_AUTHORIZATION']) && function_exists('getallheaders')) {
    $headers = getallheaders();
    if ($headers && isset($headers['Authorization'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
    }
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST','GET', 'PUT', 'OPTIONS'])) {
  http_response_code(405);
  echo json_encode([
    "status"  => false,
    "message" => "Only POST/GET/PUT/OPTIONS requests allowed",
    "code"    => "METHOD_NOT_ALLOWED"
  ]);
  exit;
}


// Add request logging for debugging (remove in production)
error_log("API Request from: " . $origin . " - Method: " . $_SERVER['REQUEST_METHOD']);

// Include database connection
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt_token/jwt_helper.php';
require_once __DIR__ . '/auth/auth_middleware.php';
require_once __DIR__ . '/helpers/email_helper.php';
require_once __DIR__ . '/helpers/otp_helper.php';

?>
