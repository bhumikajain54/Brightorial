# API Integration Summary

## 1. Profile & Settings -> Staff Management

### APIs Used:
1. **GET Faculty List**
   - Endpoint: `/faculty/get_faculty_users.php`
   - Method: `GET`
   - Service: `apiService.getFaculty`
   - Purpose: Fetch all instructors/faculty members
   - Called: On component mount (`useEffect`)

2. **POST Create Faculty**
   - Endpoint: `/faculty/create_faculty_user.php`
   - Method: `POST`
   - Service: `apiService.createFaculty`
   - Purpose: Create new instructor
   - Called: When "Add Instructor" form is submitted

3. **PUT Update Faculty**
   - Endpoint: `/faculty/update_faculty_user.php`
   - Method: `PUT`
   - Service: `apiService.updateFaculty`
   - Purpose: Update existing instructor details
   - Called: When "Edit Instructor" form is submitted

---

## 2. Student Management -> View Students

### APIs Used:
1. **GET Institute Students**
   - Endpoint: `/institute/get_institute_students.php`
   - Method: `GET`
   - Service: `apiService.institute_view_students`
   - Purpose: Fetch all students for the institute
   - Called: On component mount and after updates

2. **GET Student Profile (Single)**
   - Endpoint: `/institute/get_student_profile.php?id={studentId}`
   - Method: `GET`
   - Service: `apiService.get_student_profile`
   - Purpose: Fetch detailed profile of a single student
   - Called: When "View" button is clicked

3. **GET Courses**
   - Endpoint: `/courses/courses.php`
   - Method: `GET`
   - Service: `apiService.getCourses`
   - Purpose: Fetch all courses for filter dropdown
   - Called: On component mount

4. **GET Batches**
   - Endpoint: `/batches/get_batch.php`
   - Method: `GET`
   - Service: `apiService.getBatches`
   - Purpose: Fetch batches for filter dropdown and course-batch assignment
   - Called: On component mount and when course is selected

5. **GET Batches by Course**
   - Endpoint: `/batches/get_batch.php?course_id={courseId}`
   - Method: `GET`
   - Service: `apiService.getBatches` (with params)
   - Purpose: Fetch batches for a specific course
   - Called: When course is selected in edit modal

6. **PUT Update Student**
   - Endpoint: `/institute/update_student.php`
   - Method: `PUT`
   - Service: `apiService.update_student`
   - Purpose: Update student details (course, batch, status)
   - Called: When "Save Changes" is clicked in edit modal

---

## How to See API Calls in Network Tab

### Step 1: Open Developer Tools
- Press `F12` or `Right Click > Inspect`
- Go to **Network** tab

### Step 2: Filter for API Calls
- Click on **"Fetch/XHR"** filter button (not "All" or "JS")
- This will show only API calls, not JavaScript files

### Step 3: Clear and Reload
- Click the **Clear** button (🚫 icon) to clear previous requests
- Refresh the page or navigate to the section
- You should now see API calls like:
  - `get_faculty_users.php`
  - `get_institute_students.php`
  - `courses.php`
  - `get_batch.php`
  - etc.

### Step 4: Check API Details
- Click on any API call to see:
  - **Headers**: Request/Response headers
  - **Payload**: Data sent (for POST/PUT)
  - **Response**: Data received
  - **Preview**: Formatted response

### Why APIs Might Not Show:
1. **Wrong Filter**: Make sure "Fetch/XHR" is selected, not "All" or "JS"
2. **Cached Requests**: Some requests show as "304 Not Modified" (cached)
3. **Page Not Loaded**: Navigate to the specific page (Staff Management or View Students)
4. **Console Logs**: Check Console tab for `🌐 GET Request:` and `✅ GET Response:` logs

---

## Console Logs Available

All API calls are logged in Console:
- `🌐 GET Request:` - Shows URL and token info
- `✅ GET Response:` - Shows response data
- `❌ GET Error:` - Shows error details

Same for POST, PUT, DELETE methods.

