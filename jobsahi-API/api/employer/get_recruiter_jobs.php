<?php
// get_recruiter_jobs_.php - List jobs/applications based on admin_action and user role with dashboard stats
require_once '../cors.php';

// ✅ Authenticate JWT and allow all roles
$decoded = authenticateJWT(['admin', 'recruiter']); // returns array
$role = strtolower($decoded['role'] ?? '');
$user_id = $decoded['user_id'] ?? null;

// Build SQL based on role
try {
    $dashboard_stats = [];
    file_put_contents(__DIR__ . '/../../scratch/api_debug.log', "DEBUG: role=$role, user_id=$user_id\n", FILE_APPEND);

    // If recruiter or admin, get dashboard statistics
    if (($role === 'recruiter' || $role === 'admin') && $user_id) {
        $stats_user_id = $user_id;

        // Admin impersonation - GET params se recruiter_id lo
        if ($role === 'admin') {
            $impersonated_user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 
                                   (isset($_GET['recruiter_id']) ? intval($_GET['recruiter_id']) : 
                                   (isset($_GET['uid']) ? intval($_GET['uid']) : null));
            
            if ($impersonated_user_id) {
                $stats_user_id = $impersonated_user_id;
            } else {
                // If admin is NOT impersonating, stats_user_id remains null to show all (or we could force a selection)
                $stats_user_id = null;
            }
        }

        $sql_posted = "SELECT COUNT(*) as jobs_posted FROM jobs j";
        if ($stats_user_id) {
            $sql_posted .= " INNER JOIN recruiter_profiles rp ON j.recruiter_id = rp.id WHERE rp.user_id = ?";
        }
        $stmt_posted = $conn->prepare($sql_posted);
        if ($stats_user_id)
            $stmt_posted->bind_param("i", $stats_user_id);
        $stmt_posted->execute();
        $result_posted = $stmt_posted->get_result();
        $dashboard_stats['jobs_posted'] = $result_posted->fetch_assoc()['jobs_posted'] ?? 0;
        $stmt_posted->close();

        $sql_applied = "SELECT COUNT(DISTINCT a.id) as applied_count
                        FROM applications a
                        INNER JOIN jobs j ON a.job_id = j.id";
        if ($stats_user_id) {
            $sql_applied .= " INNER JOIN recruiter_profiles rp ON j.recruiter_id = rp.id WHERE rp.user_id = ?";
        } else {
            $sql_applied .= " WHERE 1=1";
        }
        $sql_applied .= " AND (a.status IN ('pending', 'applied', 'shortlisted', 'rejected') OR a.status IS NULL OR a.status = '') 
                         AND (a.deleted_at IS NULL OR a.deleted_at = '0000-00-00 00:00:00')";
        $stmt_applied = $conn->prepare($sql_applied);
        if ($stats_user_id)
            $stmt_applied->bind_param("i", $stats_user_id);
        $stmt_applied->execute();
        $result_applied = $stmt_applied->get_result();
        $dashboard_stats['applied_job'] = $result_applied->fetch_assoc()['applied_count'] ?? 0;
        $stmt_applied->close();

        $sql_scheduled = "SELECT COUNT(*) as interview_scheduled
                          FROM interviews i
                          INNER JOIN applications a ON i.application_id = a.id
                          INNER JOIN jobs j ON a.job_id = j.id";
        if ($stats_user_id) {
            $sql_scheduled .= " INNER JOIN recruiter_profiles rp ON j.recruiter_id = rp.id WHERE rp.user_id = ?";
        } else {
            $sql_scheduled .= " WHERE 1=1";
        }
        $sql_scheduled .= " AND i.status = 'scheduled' AND (i.deleted_at IS NULL OR i.deleted_at = '0000-00-00 00:00:00')";
        $stmt_scheduled = $conn->prepare($sql_scheduled);
        if ($stats_user_id)
            $stmt_scheduled->bind_param("i", $stats_user_id);
        $stmt_scheduled->execute();
        $result_scheduled = $stmt_scheduled->get_result();
        $dashboard_stats['interview_job'] = $result_scheduled->fetch_assoc()['interview_scheduled'] ?? 0;
        $stmt_scheduled->close();

        $sql_completed = "SELECT COUNT(*) as interview_completed
                          FROM applications a
                          INNER JOIN jobs j ON a.job_id = j.id";
        if ($stats_user_id) {
            $sql_completed .= " INNER JOIN recruiter_profiles rp ON j.recruiter_id = rp.id WHERE rp.user_id = ?";
        } else {
            $sql_completed .= " WHERE 1=1";
        }
        $sql_completed .= " AND a.status = 'selected' AND (a.deleted_at IS NULL OR a.deleted_at = '0000-00-00 00:00:00')";
        $stmt_completed = $conn->prepare($sql_completed);
        if ($stats_user_id)
            $stmt_completed->bind_param("i", $stats_user_id);
        $stmt_completed->execute();
        $result_completed = $stmt_completed->get_result();
        $dashboard_stats['interview_completed'] = $result_completed->fetch_assoc()['interview_completed'] ?? 0;
        $stmt_completed->close();
    }

    // ✅ Get jobs list based on role
    if ($role === 'admin') {
        if ($stats_user_id) {
            // Admin impersonating a recruiter
            $sql = "SELECT j.id, j.recruiter_id, j.title, j.description, j.location, 
                    j.skills_required, j.salary_min, j.salary_max, j.job_type, 
                    j.experience_required, j.application_deadline, j.is_remote, 
                    j.no_of_vacancies, j.status, j.admin_action, j.created_at
                    FROM jobs j
                    INNER JOIN recruiter_profiles rp ON j.recruiter_id = rp.id
                    WHERE rp.user_id = ?
                    ORDER BY j.created_at DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $stats_user_id);
        } else {
            // Admin viewing all
            $sql = "SELECT id, recruiter_id, title, description, location, skills_required, 
                    salary_min, salary_max, job_type, experience_required, application_deadline, 
                    is_remote, no_of_vacancies, status, admin_action, created_at
                    FROM jobs
                    ORDER BY created_at DESC";
            $stmt = $conn->prepare($sql);
        }
    } elseif ($role === 'recruiter' && $user_id) {
        $sql = "SELECT j.id, j.recruiter_id, j.title, j.description, j.location, 
                j.skills_required, j.salary_min, j.salary_max, j.job_type, 
                j.experience_required, j.application_deadline, j.is_remote, 
                j.no_of_vacancies, j.status, j.admin_action, j.created_at
                FROM jobs j
                INNER JOIN recruiter_profiles rp ON j.recruiter_id = rp.id
                WHERE rp.user_id = ?
                ORDER BY j.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
    } else {
        $sql = "SELECT id, recruiter_id, title, description, location, skills_required, 
                salary_min, salary_max, job_type, experience_required, application_deadline, 
                is_remote, no_of_vacancies, status, admin_action, created_at
                FROM jobs
                WHERE admin_action = 'approved'
                ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
    }

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $jobs = [];

        while ($row = $result->fetch_assoc()) {
            $jobs[] = $row;
        }

        $response = [
            "status" => true,
            "message" => "Jobs retrieved successfully",
            "data" => $jobs,
            "count" => count($jobs)
        ];

        // Add dashboard stats if available
        if (!empty($dashboard_stats)) {
            file_put_contents(__DIR__ . '/../../scratch/api_debug.log', "DEBUG: dashboard_stats=" . json_encode($dashboard_stats) . "\n", FILE_APPEND);
            $response['dashboard'] = $dashboard_stats;
        }

        echo json_encode($response);
    } else {
        echo json_encode([
            "status" => false,
            "message" => "Failed to retrieve jobs",
            "error" => $stmt->error
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "status" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>