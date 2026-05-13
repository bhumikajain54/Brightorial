<?php
require_once __DIR__ . '/../cors.php';

try {
    // Overall stats
    $stmt = $pdo->query("SELECT COUNT(*) as total_drives FROM campus_drives");
    $totalDrives = $stmt->fetch()['total_drives'];

    $stmt = $pdo->query("SELECT COUNT(*) as total_applications FROM campus_drive_applications");
    $totalApplications = $stmt->fetch()['total_applications'];

    $stmt = $pdo->query("SELECT COUNT(DISTINCT recruiter_id) as total_companies FROM campus_drive_companies");
    $totalCompanies = $stmt->fetch()['total_companies'];

    // Stats by status
    $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM campus_drive_applications GROUP BY status");
    $statusStats = $stmt->fetchAll();

    // Stats by drive
    $stmt = $pdo->query("SELECT d.title, COUNT(a.id) as applications 
                        FROM campus_drives d 
                        LEFT JOIN campus_drive_applications a ON d.id = a.drive_id 
                        GROUP BY d.id 
                        ORDER BY d.created_at DESC 
                        LIMIT 5");
    $driveStats = $stmt->fetchAll();

    echo json_encode([
        "status" => true,
        "data" => [
            "overall" => [
                "total_drives" => $totalDrives,
                "total_applications" => $totalApplications,
                "total_companies" => $totalCompanies
            ],
            "status_distribution" => $statusStats,
            "recent_drives_performance" => $driveStats
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
