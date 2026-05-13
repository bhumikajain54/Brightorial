<?php
require_once __DIR__ . '/../cors.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(["status" => false, "message" => "Invalid input"]);
    exit;
}

$required = ['title', 'organizer', 'venue', 'city', 'start_date', 'end_date'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        echo json_encode(["status" => false, "message" => "$field is required"]);
        exit;
    }
}

try {
    $stmt = $pdo->prepare("INSERT INTO campus_drives (title, organizer, venue, city, start_date, end_date, capacity_per_day, status) 
                          VALUES (:title, :organizer, :venue, :city, :start_date, :end_date, :capacity, :status)");
    
    $stmt->execute([
        'title' => $input['title'],
        'organizer' => $input['organizer'],
        'venue' => $input['venue'],
        'city' => $input['city'],
        'start_date' => $input['start_date'],
        'end_date' => $input['end_date'],
        'capacity' => $input['capacity_per_day'] ?? 100,
        'status' => $input['status'] ?? 'draft'
    ]);

    echo json_encode([
        "status" => true,
        "message" => "Campus drive created successfully",
        "drive_id" => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
