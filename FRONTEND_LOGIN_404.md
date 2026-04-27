# Frontend Login 404 Error - Diagnosis

## The Issue
Getting 404 error when trying to login from frontend.

## Root Cause
The backend needs to be deployed with the CORS fix. The frontend is correctly configured.

## What's Happening

Frontend is calling:
```
POST https://wc-backend-ayx0.onrender.com/api/v1/auth/login
```

This is **CORRECT**. The 404 means:
1. Backend is sleeping (Render free tier)
2. Backend hasn't been deployed with latest changes
3. Backend crashed/failed to start

## Quick Test

Open browser console (F12) and run:

```javascript
// Test 1: Check if backend is alive
fetch('https://wc-backend-ayx0.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend is alive:', d))
  .catch(e => console.error('❌ Backend is down:', e))

// Test 2: Check login endpoint
fetch('https://wc-backend-ayx0.onrender.com/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
})
  .then(r => r.json())
  .then(d => console.log('✅ Login endpoint works:', d))
  .catch(e => console.error('❌ Login endpoint failed:', e))
```

## Expected Results

**Test 1:** Should return `{status: "ok"}`
- If timeout/404: Backend is down or sleeping

**Test 2:** Should return `{error: "Invalid credentials"}` (401)
- If 404: Route doesn't exist (backend not deployed correctly)
- If CORS error: Backend CORS not configured

## Solution

### If Backend is Sleeping
- Wait 30-60 seconds for it to wake up
- Try login again
- Consider upgrading to paid tier

### If Backend Not Deployed
1. **Push backend changes to GitHub:**
   ```bash
   cd wc-backend
   git status
   git add .
   git commit -m "Fix CORS for CSRF token"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to https://dashboard.render.com/
   - Find `wc-backend` service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete

3. **Verify deployment:**
   - Check logs for errors
   - Test /health endpoint
   - Try login again

### If Backend Crashed
1. Check Render logs for errors
2. Verify all environment variables are set
3. Check DATABASE_URL is correct
4. Redeploy

## Frontend Changes Made (Already Done)
✅ Fixed Google OAuth URL construction
✅ CSRF token properly sent
✅ API URL correctly configured

## Backend Changes Needed (Must Deploy)
⚠️ Add X-CSRF-Token to CORS allowHeaders
⚠️ Add BACKEND_URL environment variable
⚠️ Update googleAuthService to use dynamic URL

## Next Steps
1. Test if backend is running (use tests above)
2. If down, deploy backend
3. If deployed, check logs for errors
4. Try login again
