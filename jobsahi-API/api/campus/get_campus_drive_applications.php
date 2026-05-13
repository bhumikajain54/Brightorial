<?php
require_once __DIR__ . '/../cors.php';

$drive_id = $_GET['drive_id'] ?? null;

try {
    $query = "SELECT a.*, sp.name as student_name, rp.company_name 
              FROM campus_drive_applications a
              JOIN student_profiles sp ON a.student_id = sp.id
              JOIN recruiter_profiles rp ON a.recruiter_id = rp.id";
    
    if ($drive_id) {
        $query .= " WHERE a.drive_id = :drive_id";
    }
    
    $query .= " ORDER BY a.applied_at DESC";
    
    $stmt = $pdo->prepare($query);
    if ($drive_id) {
        $stmt->bindParam(':drive_id', $drive_id);
    }
    
    $stmt->execute();
    $applications = $stmt->fetchAll();

    echo json_encode([
        "status" => true,
        "data" => $applications
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
