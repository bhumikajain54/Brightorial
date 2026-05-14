# Hostinger Deployment Guide - Fix 404 Error on Refresh

## Problem
When refreshing pages like `/login`, `/admin/dashboard`, etc., you get a 404 error because the server doesn't know about React Router routes.

## Solution

### Step 1: Build the Project
```bash
npm run build
```

This will:
- Create a `dist` folder with all production files
- Automatically copy `.htaccess` to the `dist` folder

### Step 2: Upload to Hostinger

1. **Upload ALL files from `dist` folder** to your Hostinger server's root directory (usually `public_html` or `htdocs`)

2. **IMPORTANT: Make sure `.htaccess` file is uploaded**
   - The `.htaccess` file MUST be in the same directory as `index.html`
   - Check via File Manager or FTP that `.htaccess` exists in root directory

3. **File Structure on Server Should Be:**
   ```
   public_html/
   ├── .htaccess          ← MUST BE HERE
   ├── index.html
   ├── assets/
   │   ├── css/
   │   ├── js/
   │   └── ...
   └── ...
   ```

### Step 3: Verify .htaccess is Working

1. **Check if mod_rewrite is enabled:**
   - In Hostinger cPanel, go to "Select PHP Version"
   - Make sure `mod_rewrite` is enabled

2. **Check .htaccess permissions:**
   - File permissions should be `644` or `644`
   - You can set this via File Manager or FTP

3. **Test the fix:**
   - Go to `https://yourdomain.com/login`
   - Refresh the page (F5 or Ctrl+R)
   - Should NOT show 404 error

### Step 4: If Still Getting 404

**Option A: Check .htaccess is uploaded**
- Log into Hostinger File Manager
- Navigate to root directory (public_html)
- Check if `.htaccess` file exists
- If not, manually upload it from `dist/.htaccess`

**Option B: Create .htaccess manually on server**
If the file wasn't copied, create a new file named `.htaccess` in your root directory with this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api/
  RewriteCond %{REQUEST_URI} !^/assets/
  RewriteCond %{REQUEST_URI} !\.(css|js|jpe?g|gif|png|svg|ico|woff2?|ttf|eot|json|xml|txt|pdf)$ [NC]
  
  RewriteRule ^ index.html [L]
</IfModule>

Options -Indexes
AddDefaultCharset UTF-8
```

**Option C: Check Hostinger Settings**
- In Hostinger cPanel, go to "File Manager"
- Make sure "Show Hidden Files" is enabled
- This will show `.htaccess` file

### Step 5: Clear Browser Cache
After deploying, clear your browser cache or do a hard refresh:
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

## Common Issues

### Issue 1: .htaccess not working
**Solution:** Make sure:
- File is named exactly `.htaccess` (with dot at start)
- File is in root directory (same as index.html)
- mod_rewrite is enabled in PHP settings
- File permissions are correct (644)

### Issue 2: Still getting 404
**Solution:** 
- Check server error logs in Hostinger cPanel
- Verify .htaccess syntax is correct
- Try accessing `https://yourdomain.com/.htaccess` (should show 403 Forbidden, not 404)

### Issue 3: API calls not working
**Solution:**
- Make sure API URL in `envConfig.js` points to correct domain
- Check CORS settings in API backend
- Verify API endpoints are accessible

## Testing Checklist

- [ ] Build completed successfully (`npm run build`)
- [ ] All files from `dist` folder uploaded to server
- [ ] `.htaccess` file exists in root directory
- [ ] Can access `https://yourdomain.com/` (homepage loads)
- [ ] Can access `https://yourdomain.com/login` (login page loads)
- [ ] Refresh on `/login` doesn't show 404
- [ ] Refresh on `/admin/dashboard` doesn't show 404
- [ ] All routes work after refresh

## Need Help?

If you're still facing issues:
1. Check Hostinger error logs
2. Verify .htaccess file exists and has correct content
3. Test with a simple HTML file first to ensure server is working
4. Contact Hostinger support if mod_rewrite is not enabled

