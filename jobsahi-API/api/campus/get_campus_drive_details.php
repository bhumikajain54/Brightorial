<?php
require_once __DIR__ . '/../cors.php';

$drive_id = $_GET['drive_id'] ?? null;

if (!$drive_id) {
    echo json_encode(["status" => false, "message" => "Drive ID is required"]);
    exit;
}

try {
    // Get drive info
    $stmt = $pdo->prepare("SELECT * FROM campus_drives WHERE id = :id");
    $stmt->execute(['id' => $drive_id]);
    $drive = $stmt->fetch();

    if (!$drive) {
        echo json_encode(["status" => false, "message" => "Drive not found"]);
        exit;
    }

    // Get companies
    $stmt = $pdo->prepare("SELECT c.*, rp.company_name, rp.contact_person 
                          FROM campus_drive_companies c
                          JOIN recruiter_profiles rp ON c.recruiter_id = rp.id
                          WHERE c.drive_id = :id");
    $stmt->execute(['id' => $drive_id]);
    $companies = $stmt->fetchAll();

    // Get basic stats
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM campus_drive_applications WHERE drive_id = :id");
    $stmt->execute(['id' => $drive_id]);
    $stats = $stmt->fetch();

    echo json_encode([
        "status" => true,
        "data" => [
            "drive" => $drive,
            "companies" => $companies,
            "total_applications" => $stats['total']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
