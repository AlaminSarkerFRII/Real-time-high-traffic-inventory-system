# Railway 502 Error - "Application failed to respond" - Fix

## Problem
The backend deployed but the application is not responding (502 error).

## Solution: Check Railway Logs

### Step 1: Check Deployment Logs

1. **Go to Railway Dashboard**
   - Open your project
   - Click on your backend service

2. **Check Logs**
   - Click on "Deployments" tab
   - Click on the latest deployment
   - Or click "Logs" tab to see real-time logs

3. **Look for Errors**
   - Check if the backend started successfully
   - Look for error messages
   - Common issues listed below

### Step 2: Common Issues and Fixes

#### Issue 1: Database Connection Error

**Error in logs:**
```
Connection error: SequelizeConnectionError
Cannot connect to database
```

**Fix:**
- Verify `DATABASE_URL` environment variable is set correctly in Railway
- Check `PGSSLMODE=require` is set
- Ensure connection string is correct (copy from Neon dashboard)
- Make sure no extra quotes around values

#### Issue 2: Missing Environment Variables

**Error in logs:**
```
DATABASE_URL is not set
```

**Fix:**
- Go to Railway → Your Service → Variables tab
- Add `DATABASE_URL` with your Neon connection string
- Add `PGSSLMODE=require`
- Railway will auto-redeploy

#### Issue 3: Application Crashed on Start

**Error in logs:**
```
Error: Cannot find module...
```

**Fix:**
- Check if all dependencies are installed
- Verify `package.json` is correct
- Check Root Directory is set to `backend`

#### Issue 4: Port Binding Error

**Error in logs:**
```
Port already in use
EADDRINUSE
```

**Fix:**
- Railway auto-assigns ports via `PORT` environment variable
- Your code should use `process.env.PORT || 4000`
- Check your `server.js` uses `process.env.PORT`

### Step 3: Verify Environment Variables

In Railway Dashboard → Your Service → Variables:

**Required:**
- ✅ `DATABASE_URL` = Your Neon connection string
- ✅ `PGSSLMODE` = `require`

**Optional:**
- `PORT` = (Railway auto-assigns)

**After Frontend Deployment:**
- `FRONTEND_URL` = Your Vercel URL
- `CORS_ORIGIN` = Your Vercel URL

### Step 4: Check Settings

In Railway Dashboard → Your Service → Settings:

- ✅ Root Directory: `backend`
- ✅ Start Command: `npm start` (or leave empty for auto-detect)

### Step 5: Redeploy

1. After fixing issues, Railway should auto-redeploy
2. Or manually trigger redeploy: Service → Deployments → Redeploy
3. Watch logs for success messages

### Expected Success Logs

After fixing, you should see:
```
Connecting to Neon PostgreSQL...
Connected to Neon PostgreSQL
Database synced
🚀 Server running on port XXX
```

## Quick Checklist

- [ ] Check Railway logs for specific error messages
- [ ] Verify `DATABASE_URL` is set correctly
- [ ] Verify `PGSSLMODE=require` is set
- [ ] Check Root Directory is set to `backend`
- [ ] Check Start Command is `npm start` (or auto-detect)
- [ ] Verify backend/server.js uses `process.env.PORT`
- [ ] Check Neon database is accessible
- [ ] Try redeploying after fixing issues

## Next Steps

1. Check Railway logs first (most important!)
2. Fix the specific error shown in logs
3. Redeploy
4. Test again: `https://your-url.railway.app/api/health`
