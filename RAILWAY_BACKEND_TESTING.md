# Testing Your Railway Backend

## Important: Backend URL Shows API, Not a Webpage

The Railway backend URL (`https://real-time-high-traffic-inventory-system-production.up.railway.app/`) is your **API server**, not a website. You won't see a webpage when you visit it in a browser.

## How to Test Your Backend

### 1. Test Health Endpoint

Open in browser or use curl:
```
https://real-time-high-traffic-inventory-system-production.up.railway.app/api/health
```

**Expected Response:**
```json
{"status":"OK","message":"Inventory system is running"}
```

If you see this, your backend is working! ✅

### 2. Test API Endpoints

#### Get Drops:
```
GET https://real-time-high-traffic-inventory-system-production.up.railway.app/api/drops
```

#### Create a Drop:
```
POST https://real-time-high-traffic-inventory-system-production.up.railway.app/api/drops
Content-Type: application/json

{
  "name": "Test Product",
  "price": 100,
  "totalStock": 10
}
```

## Common Errors

### 1. "Cannot GET /" Error

**This is NORMAL!** ✅
- The backend doesn't have a route for `/`
- This is expected behavior
- Test `/api/health` instead

### 2. Connection Error / Timeout

**Check:**
- Railway service is running (check Railway dashboard)
- Environment variables are set correctly
- Database connection is working (check Railway logs)

### 3. CORS Errors

**This is also NORMAL if testing from browser:**
- CORS errors when testing API directly from browser are expected
- The frontend will work fine once connected
- Use curl/Postman to test API endpoints

## Check Railway Logs

1. Go to Railway Dashboard
2. Click on your backend service
3. Click "Deployments" or "Logs" tab
4. Look for:
   - ✅ "Connected to Neon PostgreSQL"
   - ✅ "Database synced"
   - ✅ "🚀 Server running on port XXX"
   - ❌ Any error messages

## What's Next?

Your backend URL is for the **API only**. To see the full application:

1. ✅ Backend is deployed: `https://real-time-high-traffic-inventory-system-production.up.railway.app`
2. ⏳ Deploy frontend to Vercel (see README.md)
3. ⏳ Set `VITE_BACKEND_URL` in Vercel to your Railway URL
4. ⏳ Set `FRONTEND_URL` and `CORS_ORIGIN` in Railway to your Vercel URL

## Quick Test Commands

### Using curl:
```bash
# Health check
curl https://real-time-high-traffic-inventory-system-production.up.railway.app/api/health

# Get drops
curl https://real-time-high-traffic-inventory-system-production.up.railway.app/api/drops
```

### Using browser:
Just visit:
```
https://real-time-high-traffic-inventory-system-production.up.railway.app/api/health
```

You should see JSON response, not a webpage.
