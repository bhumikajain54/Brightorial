# Recruiter Profile - Backend API Checklist

## ✅ Frontend Fixes Applied:
1. Changed `postMultipart` to `putMultipart` for logo updates
2. Added profile refresh after successful update
3. Fixed logo URL handling with proper base URL
4. Added proper error handling

## 🔍 Backend API Requirements to Check:

### 1. GET Profile API (`/employer/profile.php`)
- ✅ Should return profile data with logo path
- ✅ Logo path should be relative (e.g., `recruiter_123_logo.jpg`) or full URL
- ✅ Response structure: `{ success: true, data: { profiles: [{ documents: { company_logo: "..." } }] } }`

### 2. UPDATE Profile API (`/employer/update_recruiter_profile.php`)

#### For Logo Upload (PUT with multipart):
- ✅ Should accept `company_logo` file in FormData
- ✅ Should save file to `/uploads/` folder
- ✅ **IMPORTANT**: Logo filename should be unique based on recruiter ID
  - Format: `recruiter_{recruiter_id}_logo_{timestamp}.{ext}`
  - Example: `recruiter_5_logo_1703123456.jpg`
- ✅ Should update database with new logo filename/path
- ✅ Should return updated profile data

#### For Text Updates (PUT with JSON):
- ✅ Should accept JSON payload with fields:
  - `company_name`
  - `industry`
  - `website`
  - `email`
  - `phone_number`
  - `location`
- ✅ Should update database and return success response

### 3. Logo File Handling:
- ✅ Upload folder: `/uploads/` (server root)
- ✅ Unique filename: Use `recruiter_id` + `timestamp` + original extension
- ✅ File validation: Check file type (jpg, png, svg, webp) and size (max 5MB)
- ✅ Delete old logo file when new one is uploaded (optional but recommended)

### 4. Response Format:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profiles": [{
      "documents": {
        "company_logo": "recruiter_5_logo_1703123456.jpg"
      }
    }]
  }
}
```

### 5. Error Handling:
- ✅ Return proper error messages for validation failures
- ✅ Return error if file upload fails
- ✅ Return error if database update fails

## 🧪 Testing Checklist:
1. ✅ GET profile - logo should display correctly
2. ✅ UPDATE profile without logo - should work
3. ✅ UPDATE profile with logo - should upload and save
4. ✅ Logo filename should be unique per recruiter
5. ✅ Logo should be accessible from `/uploads/` folder
6. ✅ After update, GET should return new logo path

