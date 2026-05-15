<?php
// get_job_course_dashboard_stats.php
// 🔹 Combined dashboard metrics for Admin (Jobs + Courses + Institutes)
require_once '../cors.php';
error_log("Dashboard Stats: Script initiated");

// ✅ Allow only admin users
$decoded = authenticateJWT(['admin']);

try {

    // ----------------------------------------------------------------------
    // 🧭 JOB CONTROL SECTION
    // ----------------------------------------------------------------------

    error_log("Dashboard Stats: Starting job section");
    // Total Jobs
    $sql_total_jobs = "SELECT COUNT(*) AS total_jobs FROM jobs WHERE admin_action != 'rejected'";
    $total_jobs = $conn->query($sql_total_jobs)->fetch_assoc()['total_jobs'] ?? 0;

    // Active Campaigns
    $sql_active_campaigns = "SELECT COUNT(*) AS active_campaigns FROM jobs WHERE status = 'open' AND admin_action = 'approved'";
    $active_campaigns = $conn->query($sql_active_campaigns)->fetch_assoc()['active_campaigns'] ?? 0;

    // Flagged Jobs
    $sql_flagged_jobs = "SELECT COUNT(*) AS flagged_jobs FROM job_flags";
    $flagged_jobs = $conn->query($sql_flagged_jobs)->fetch_assoc()['flagged_jobs'] ?? 0;

    // Promoted Jobs
    $promoted_jobs = 0;

    error_log("Dashboard Stats: Starting course section");
    // ----------------------------------------------------------------------
    // 🎓 COURSE CONTROL SECTION
    // ----------------------------------------------------------------------

    // Total Courses
    $sql_total_courses = "SELECT COUNT(*) AS total_courses FROM courses WHERE admin_action != 'rejected'";
    $total_courses = $conn->query($sql_total_courses)->fetch_assoc()['total_courses'] ?? 0;

    // Active Batches
    $sql_active_batches = "SELECT COUNT(*) AS active_batches FROM batches WHERE admin_action = 'approved'";
    $active_batches = $conn->query($sql_active_batches)->fetch_assoc()['active_batches'] ?? 0;

    // Total Enrollments
    $sql_total_enrollments = "SELECT COUNT(*) AS total_enrollments FROM student_course_enrollments WHERE admin_action = 'approved'";
    $total_enrollments = $conn->query($sql_total_enrollments)->fetch_assoc()['total_enrollments'] ?? 0;

    // ✅ Total Institutes (all statuses)
    $sql_total_institutes = "SELECT COUNT(*) AS total_institutes FROM institute_profiles";
    $total_institutes = $conn->query($sql_total_institutes)->fetch_assoc()['total_institutes'] ?? 0;

    error_log("Dashboard Stats: Finished all queries");


    // ----------------------------------------------------------------------
    // 📦 Final Response
    // ----------------------------------------------------------------------

    echo json_encode([
        "status" => true,
        "message" => "Job, Course & Institute dashboard stats fetched successfully",
        "data" => [
            "jobs" => [
                "total_jobs" => (int)$total_jobs,
                "active_campaigns" => (int)$active_campaigns,
                "flagged_jobs" => (int)$flagged_jobs,
                "promoted_jobs" => (int)$promoted_jobs
            ],
            "courses" => [
                "total_courses" => (int)$total_courses,
                "active_batches" => (int)$active_batches,
                "total_enrollments" => (int)$total_enrollments,
                "total_institutes" => (int)$total_institutes
            ]
        ]
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        "status" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
