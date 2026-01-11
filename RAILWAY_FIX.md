# Railway "Missing script: start" - Fix

## Problem
Railway is running `npm start` from the root directory instead of the `backend` directory, so it can't find the start script.

## Solution

You MUST set the **Root Directory** to `backend` in Railway settings.

### Steps to Fix:

1. **Go to Railway Dashboard**
   - Open your project
   - Click on your backend service

2. **Go to Settings Tab**
   - Click on "Settings" in the service menu

3. **Set Root Directory**
   - Find "Root Directory" section
   - Enter: `backend`
   - Click "Save" or "Update"

4. **Verify Start Command (Optional)**
   - Railway should auto-detect `npm start` from `backend/package.json`
   - If not, you can also set "Start Command" to: `npm start`

5. **Redeploy**
   - Railway will automatically redeploy after saving
   - Wait for deployment to complete

## Important Settings

In Railway Dashboard → Your Service → Settings:

- ✅ **Root Directory**: `backend` (REQUIRED)
- ✅ **Start Command**: `npm start` (optional - auto-detected if Root Directory is set)
- ✅ **Build Command**: Leave empty (Railway auto-detects)

## After Fixing

Check Railway logs - you should see:
- Build completes successfully
- "npm start" or "node server.js" running
- "Connected to Neon PostgreSQL"
- "🚀 Server running on port XXX"

## Why This Happens

Railway defaults to the repository root. Since your `package.json` with the "start" script is in the `backend/` directory, Railway needs to know to look there.

## Alternative: Use Procfile

If Root Directory doesn't work, Railway should also detect `backend/Procfile`:
- File: `backend/Procfile`
- Content: `web: node server.js`

But setting Root Directory to `backend` is the recommended solution.
