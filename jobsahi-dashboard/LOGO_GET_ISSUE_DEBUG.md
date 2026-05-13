# Logo GET Issue - Debugging Guide

## 🔴 Current Issue:
- Logo upload (POST/UPDATE) is working ✅
- Logo display (GET) is failing with **422 error** ❌
- Error: `logo_2.png` returns 422 (Unprocessable Entity)

## 🔍 What I Fixed in Frontend:

### 1. Enhanced GET Profile Logic:
- ✅ Added multiple response structure checks
- ✅ Try logo from multiple locations:
  - `documents.company_logo`
  - `documents.logo`
  - `professional_info.company_logo`
  - `professional_info.logo`
  - `profile.company_logo`
  - `profile.logo`

### 2. Improved URL Construction:
- ✅ Handles absolute URLs (starts with http)
- ✅ Handles relative paths with `/uploads/`
- ✅ Handles relative paths without `/uploads/`
- ✅ Uses proper base URL from `env.apiHost`

### 3. Added Error Handling:
- ✅ Image load error handler
- ✅ Console logging for debugging
- ✅ Graceful fallback if image fails

## 🧪 How to Debug:

### Step 1: Check Console Logs
Open browser console and look for:
```
📥 GET Profile Response: {...}
📋 Profile data: {...}
🖼️ Logo path found: ...
🖼️ Final logo URL: ...
```

### Step 2: Check What API Returns
In console, check the `📥 GET Profile Response` log:
- What is the actual structure?
- Where is `company_logo` located?
- What value does it have? (e.g., `logo_2.png`, `/uploads/logo_2.png`, etc.)

### Step 3: Check Network Tab
- Look at `profile.php` request
- Check Response tab - what does it return?
- Check if `company_logo` field exists and what value it has

### Step 4: Check Logo Request
- Look at `logo_2.png` request
- Check the full URL being requested
- Check why it's getting 422 error

## 🔧 Possible Issues & Solutions:

### Issue 1: Logo Path Format
**Problem:** API returns `logo_2.png` but file is at `/uploads/logo_2.png`

**Solution:** Frontend now handles this - constructs full path automatically

### Issue 2: Logo Path Already Has /uploads/
**Problem:** API returns `/uploads/logo_2.png` but URL construction adds it again

**Solution:** Frontend now checks if path already has `/uploads/` and handles both cases

### Issue 3: Logo File Doesn't Exist
**Problem:** File was uploaded but not saved properly, or wrong filename

**Solution:** 
- Check backend upload logic
- Verify file exists in `/uploads/` folder
- Check filename matches what API returns

### Issue 4: CORS or Permission Issue
**Problem:** 422 error might be server rejecting the request

**Solution:**
- Check server logs
- Verify `/uploads/` folder permissions
- Check if file is accessible directly via browser

## 📋 Backend Checklist:

1. ✅ GET API should return logo path in response
2. ✅ Logo path should be relative filename (e.g., `logo_2.png`) OR full path
3. ✅ Logo file should exist in `/uploads/` folder
4. ✅ Logo file should be accessible (proper permissions)
5. ✅ Logo filename should match what API returns

## 🎯 Next Steps:

1. **Check Console Logs** - See what API actually returns
2. **Check Network Tab** - See the exact URL being requested
3. **Check Backend** - Verify logo file exists and is accessible
4. **Test Direct URL** - Try accessing logo URL directly in browser

## 💡 Quick Test:

After checking console logs, you should see:
- What logo path API returns
- What final URL is constructed
- Why image fails to load

Then we can fix the exact issue!

