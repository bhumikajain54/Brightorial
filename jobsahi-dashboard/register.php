<?php
// register.php - User registration with password hashing and complete profile creation
require_once '../cors.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(array("message" => "Only POST requests allowed", "status" => false));
    exit;
}

// Check if data is JSON or multipart/form-data
$is_multipart = isset($_FILES) && !empty($_FILES);
$data = array();

if ($is_multipart) {
    // Handle multipart/form-data (for file uploads)
    $data = $_POST;
    // Files will be handled separately via $_FILES
} else {
    // Handle JSON data
    $json_input = file_get_contents('php://input');
    $data = json_decode($json_input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(array("message" => "Invalid JSON data", "status" => false));
        exit;
    }
}

// Check if required fields exist
$required_fields = ['user_name', 'email', 'password', 'phone_number', 'role'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        echo json_encode(array("message" => ucfirst(str_replace('_', ' ', $field)) . " is required", "status" => false));
        exit;
    }
}

$user_name = trim($data['user_name']);
$email = trim($data['email']);
$password = trim($data['password']);
$phone_number = trim($data['phone_number']);
$role = isset($data['role']) ? trim($data['role']) : 'student';
$is_verified = isset($data['is_verified']) ? (int)$data['is_verified'] : 0;
$status = isset($data['status']) ? trim($data['status']) : 'active';

// Validate role
$allowed_roles = ['student', 'recruiter', 'institute', 'admin'];
if (!in_array($role, $allowed_roles)) {
    echo json_encode(array("message" => "Invalid role. Allowed roles: student, recruiter, institute, admin", "status" => false));
    exit;
}

// Validate status
$allowed_statuses = ['active', 'inactive'];
if (!in_array($status, $allowed_statuses)) {
    echo json_encode(array("message" => "Invalid status. Allowed statuses: active, inactive", "status" => false));
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(array("message" => "Invalid email format", "status" => false));
    exit;
}

// Password strength validation
if (strlen($password) < 6) {
    echo json_encode(array("message" => "Password must be at least 6 characters long", "status" => false));
    exit;
}

include "../db.php";

// Start transaction
mysqli_autocommit($conn, FALSE);

// Function to handle file upload
function handleFileUpload($file_key, $upload_dir = '../uploads/') {
    if (!isset($_FILES[$file_key]) || $_FILES[$file_key]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    
    $file = $_FILES[$file_key];
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    
    if (!in_array($file['type'], $allowed_types)) {
        return null;
    }
    
    // Create upload directory if it doesn't exist
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $file_name = uniqid() . '_' . time() . '.' . $file_extension;
    $file_path = $upload_dir . $file_name;
    
    if (move_uploaded_file($file['tmp_name'], $file_path)) {
        // Return relative path
        return 'uploads/' . $file_name;
    }
    
    return null;
}

try {
    // Check if email already exists
    $check_sql = "SELECT id FROM users WHERE email = ?";
    if ($check_stmt = mysqli_prepare($conn, $check_sql)) {
        mysqli_stmt_bind_param($check_stmt, "s", $email);
        mysqli_stmt_execute($check_stmt);
        $check_result = mysqli_stmt_get_result($check_stmt);
        
        if (mysqli_num_rows($check_result) > 0) {
            throw new Exception("Email already exists");
        }
        mysqli_stmt_close($check_stmt);
    }

    // Check if phone number already exists
    $check_phone_sql = "SELECT id FROM users WHERE phone_number = ?";
    if ($check_phone_stmt = mysqli_prepare($conn, $check_phone_sql)) {
        mysqli_stmt_bind_param($check_phone_stmt, "s", $phone_number);
        mysqli_stmt_execute($check_phone_stmt);
        $check_phone_result = mysqli_stmt_get_result($check_phone_stmt);
        
        if (mysqli_num_rows($check_phone_result) > 0) {
            throw new Exception("Phone number already exists");
        }
        mysqli_stmt_close($check_phone_stmt);
    }

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $sql = "INSERT INTO users (user_name, email, password, phone_number, role, is_verified, status, created_at, last_activity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

    if ($stmt = mysqli_prepare($conn, $sql)) {
        mysqli_stmt_bind_param($stmt, "sssssis", $user_name, $email, $hashed_password, $phone_number, $role, $is_verified, $status);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("User registration failed: " . mysqli_error($conn));
        }
        
        $user_id = mysqli_insert_id($conn);
        mysqli_stmt_close($stmt);
        
        // Create profile based on role with all fields
        $profile_created = false;
        $profile_id = null;
        
        switch ($role) {
            case 'admin':
                // Admin profile (if you have admin_profiles table)
                $employee_id = isset($data['employee_id']) ? trim($data['employee_id']) : null;
                $profile_photo = handleFileUpload('profile_photo');
                
                $profile_sql = "INSERT INTO admin_profiles (user_id, employee_id, profile_photo, created_at, updated_at) 
                                VALUES (?, ?, ?, NOW(), NOW())";
                if ($profile_stmt = mysqli_prepare($conn, $profile_sql)) {
                    mysqli_stmt_bind_param($profile_stmt, "iss", $user_id, $employee_id, $profile_photo);
                    if (mysqli_stmt_execute($profile_stmt)) {
                        $profile_id = mysqli_insert_id($conn);
                        $profile_created = true;
                    }
                    mysqli_stmt_close($profile_stmt);
                }
                break;
                
            case 'recruiter':
                $company_website = isset($data['company_website']) ? trim($data['company_website']) : null;
                $designation = isset($data['designation']) ? trim($data['designation']) : null;
                $industry_type = isset($data['industry_type']) ? trim($data['industry_type']) : null;
                $office_address = isset($data['office_address']) ? trim($data['office_address']) : null;
                $gst_pan = isset($data['gst_pan']) ? trim($data['gst_pan']) : null;
                $company_logo = handleFileUpload('company_logo');
                
                $profile_sql = "INSERT INTO recruiter_profiles 
                                (user_id, company_website, designation, industry_type, office_address, gst_pan, company_logo, created_at, modified_at) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
                if ($profile_stmt = mysqli_prepare($conn, $profile_sql)) {
                    mysqli_stmt_bind_param($profile_stmt, "issssss", $user_id, $company_website, $designation, $industry_type, $office_address, $gst_pan, $company_logo);
                    if (mysqli_stmt_execute($profile_stmt)) {
                        $profile_id = mysqli_insert_id($conn);
                        $profile_created = true;
                    }
                    mysqli_stmt_close($profile_stmt);
                }
                break;
                
            case 'institute':
                $institute_type = isset($data['institute_type']) ? trim($data['institute_type']) : null;
                $registration_number = isset($data['registration_number']) ? trim($data['registration_number']) : null;
                $affiliation_details = isset($data['affiliation_details']) ? trim($data['affiliation_details']) : null;
                $principal_name = isset($data['principal_name']) ? trim($data['principal_name']) : null;
                $institute_address = isset($data['institute_address']) ? trim($data['institute_address']) : null;
                $institute_website = isset($data['institute_website']) ? trim($data['institute_website']) : null;
                $courses_offered = isset($data['courses_offered']) ? (is_array($data['courses_offered']) ? json_encode($data['courses_offered']) : $data['courses_offered']) : null;
                $institute_logo = handleFileUpload('institute_logo');
                
                $profile_sql = "INSERT INTO institute_profiles 
                                (user_id, institute_type, registration_number, affiliation_details, principal_name, 
                                 institute_address, institute_website, courses_offered, institute_logo, created_at, modified_at) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
                if ($profile_stmt = mysqli_prepare($conn, $profile_sql)) {
                    mysqli_stmt_bind_param($profile_stmt, "issssssss", $user_id, $institute_type, $registration_number, 
                                          $affiliation_details, $principal_name, $institute_address, $institute_website, 
                                          $courses_offered, $institute_logo);
                    if (mysqli_stmt_execute($profile_stmt)) {
                        $profile_id = mysqli_insert_id($conn);
                        $profile_created = true;
                    }
                    mysqli_stmt_close($profile_stmt);
                }
                break;
                
            case 'student':
                $date_of_birth = isset($data['date_of_birth']) ? trim($data['date_of_birth']) : null;
                $gender = isset($data['gender']) ? trim($data['gender']) : null;
                $city = isset($data['city']) ? trim($data['city']) : null;
                $state = isset($data['state']) ? trim($data['state']) : null;
                $country = isset($data['country']) ? trim($data['country']) : null;
                $pin_code = isset($data['pin_code']) ? trim($data['pin_code']) : null;
                $highest_qualification = isset($data['highest_qualification']) ? trim($data['highest_qualification']) : null;
                $college_name = isset($data['college_name']) ? trim($data['college_name']) : null;
                $passing_year = isset($data['passing_year']) ? trim($data['passing_year']) : null;
                $marks_cgpa = isset($data['marks_cgpa']) ? trim($data['marks_cgpa']) : null;
                $skills = isset($data['skills']) ? (is_array($data['skills']) ? json_encode($data['skills']) : $data['skills']) : null;
                $preferred_job_location = isset($data['preferred_job_location']) ? trim($data['preferred_job_location']) : null;
                $linkedin_portfolio_link = isset($data['linkedin_portfolio_link']) ? trim($data['linkedin_portfolio_link']) : null;
                $profile_photo = handleFileUpload('profile_photo');
                $resume_cv = handleFileUpload('resume_cv');
                
                $profile_sql = "INSERT INTO student_profiles 
                                (user_id, date_of_birth, gender, city, state, country, pin_code, 
                                 highest_qualification, college_name, passing_year, marks_cgpa, skills, 
                                 preferred_job_location, linkedin_portfolio_link, profile_photo, resume, created_at, updated_at) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
                if ($profile_stmt = mysqli_prepare($conn, $profile_sql)) {
                    mysqli_stmt_bind_param($profile_stmt, "isssssssssssssss", $user_id, $date_of_birth, $gender, $city, $state, 
                                          $country, $pin_code, $highest_qualification, $college_name, $passing_year, 
                                          $marks_cgpa, $skills, $preferred_job_location, $linkedin_portfolio_link, 
                                          $profile_photo, $resume_cv);
                    if (mysqli_stmt_execute($profile_stmt)) {
                        $profile_id = mysqli_insert_id($conn);
                        $profile_created = true;
                    }
                    mysqli_stmt_close($profile_stmt);
                }
                break;
        }
        
        if (!$profile_created && $role !== 'admin') {
            throw new Exception("Failed to create " . $role . " profile");
        }
        
        // Commit transaction
        mysqli_commit($conn);
        
        $response_data = array(
            "message" => "User registered successfully" . ($role !== 'admin' ? " with " . $role . " profile" : ""), 
            "status" => true,
            "user_id" => $user_id,
            "role" => $role,
            "user_name" => $user_name,
            "email" => $email,
            "is_verified" => $is_verified
        );
        
        if ($profile_id !== null) {
            $response_data["profile_id"] = $profile_id;
        }
        
        echo json_encode($response_data);
        
    } else {
        throw new Exception("Database prepare failed: " . mysqli_error($conn));
    }
    
} catch (Exception $e) {
    // Rollback transaction on error
    mysqli_rollback($conn);
    echo json_encode(array("message" => $e->getMessage(), "status" => false));
}

// Reset autocommit and close connection
mysqli_autocommit($conn, TRUE);
mysqli_close($conn);
?>

