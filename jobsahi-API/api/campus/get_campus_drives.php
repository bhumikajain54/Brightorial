<?php
require_once __DIR__ . '/../cors.php';

// Get parameters
$status = $_GET['status'] ?? null;

try {
    $query = "SELECT d.*, 
              (SELECT COUNT(*) FROM campus_drive_companies WHERE drive_id = d.id) as total_companies,
              (SELECT COUNT(*) FROM campus_drive_applications WHERE drive_id = d.id) as total_applications
              FROM campus_drives d";
    
    if ($status && $status !== 'all') {
        $query .= " WHERE d.status = :status";
    }
    
    $query .= " ORDER BY d.start_date DESC";
    
    $stmt = $pdo->prepare($query);
    
    if ($status && $status !== 'all') {
        $stmt->bindParam(':status', $status);
    }
    
    $stmt->execute();
    $drives = $stmt->fetchAll();

    echo json_encode([
        "status" => true,
        "data" => $drives
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
