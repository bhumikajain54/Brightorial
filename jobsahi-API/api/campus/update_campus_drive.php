<?php
require_once __DIR__ . '/../cors.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['drive_id'])) {
    echo json_encode(["status" => false, "message" => "Drive ID is required"]);
    exit;
}

$drive_id = $input['drive_id'];
unset($input['drive_id']);

if (empty($input)) {
    echo json_encode(["status" => false, "message" => "No fields to update"]);
    exit;
}

try {
    $fields = [];
    $params = ['id' => $drive_id];
    
    foreach ($input as $key => $value) {
        $fields[] = "$key = :$key";
        $params[$key] = $value;
    }
    
    $sql = "UPDATE campus_drives SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        "status" => true,
        "message" => "Campus drive updated successfully"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
