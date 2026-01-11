# Real-Time High-Traffic Inventory System

A Node.js backend for managing limited edition sneaker drops with real-time stock updates and atomic reservations.

## Features

- **Atomic Reservations**: Prevent overselling with database-level locking
- **Real-Time Updates**: Live stock updates via WebSockets
- **Automatic Expiration**: 60-second reservation windows with background cleanup
- **Activity Feed**: Top 3 recent purchasers per drop
- **Purchase Flow**: Complete reserved items with permanent stock deduction

## Tech Stack

- **Backend**: Node.js + Express + Socket.io
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: PostgreSQL (Neon)
- **ORM**: Sequelize
- **Real-Time**: Socket.io
- **State Management**: Database transactions for consistency

## Architecture Highlights

### Concurrency Prevention
- Database row-level locking (`SELECT ... FOR UPDATE`)
- Transaction-based operations ensure consistency
- No race conditions between multiple reservation attempts

### Expiration Handling
- Background service checks every 10 seconds
- Automatic stock recovery for expired reservations
- Real-time broadcast of stock updates

### Real-Time Communication
- Socket.io for instant client updates
- Broadcast stock changes to all connected clients
- Activity feed updates for purchase events

## Setup

### Option 1: Docker (Recommended for Easy Setup)

1. **Clone the repository:**
   ```bash
   git clone git@github.com:AlaminSarkerFRII/Real-time-high-traffic-inventory-system.git
   cd Real-time-high-traffic-inventory-system
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration (for Docker, use local PostgreSQL settings).

3. **Run with Docker:**
   ```bash
   docker compose up --build
   ```

4. **Access the application:**
   - **Application (via Nginx)**: `http://localhost:8080`
   - **Backend API**: `http://localhost:8080/api`
   - **Database (from host)**: `localhost:15432`

### Option 2: Manual Setup (Local Development)

#### Prerequisites

- Node.js (v16+)
- Neon database account (or local PostgreSQL)

#### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone git@github.com:AlaminSarkerFRII/Real-time-high-traffic-inventory-system.git
   cd Real-time-high-traffic-inventory-system
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your Neon database connection string:
   ```env
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   PGSSLMODE=require
   PORT=4000
   VITE_BACKEND_URL=http://localhost:4000
   ```

3. **Setup Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   
   You should see: "Connected to Neon PostgreSQL" and "🚀 Server running on port 4000"

4. **Setup Frontend (in new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application:**
   - **Frontend**: `http://localhost:5173`
   - **Backend API**: `http://localhost:4000/api`
   - **Health Check**: `http://localhost:4000/api/health`

## Local Testing

### Quick Test Checklist

1. ✅ Backend starts and connects to database
2. ✅ Frontend starts without errors
3. ✅ Browser loads the page
4. ✅ Connection indicator shows "Connected" (green)
5. ✅ Can create a drop
6. ✅ Can make a reservation
7. ✅ Can complete a purchase
8. ✅ Real-time updates work (test with two browser windows)

### Testing Real-Time Updates

1. Open two browser windows side-by-side
2. Window 1: Create a reservation
3. Window 2: Should see stock update automatically
4. Window 1: Complete purchase
5. Window 2: Should see stock update and new purchase in activity feed

## Deployment

This project uses a hybrid deployment strategy:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Node.js + Express + Socket.io)
- **Database**: Neon (PostgreSQL)

### Step 1: Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string from dashboard
4. Update your local `.env` file with the connection string
5. Test connection locally: `cd backend && npm start`

### Step 2: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **Important Settings:**
   - Set **Root Directory** to: `backend`
   - Set **Start Command** to: `npm start` (or Railway will auto-detect)
5. **Add Environment Variables:**
   - `DATABASE_URL` = Your Neon connection string
   - `PGSSLMODE` = `require`
   - `FRONTEND_URL` = (add after frontend deployment)
   - `CORS_ORIGIN` = (add after frontend deployment)
6. Deploy and wait for completion
7. Copy your Railway backend URL (e.g., `https://your-app.railway.app`)

### Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Configure Project Settings:**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Add Environment Variable:**
   - `VITE_BACKEND_URL` = Your Railway backend URL
6. Click "Deploy"
7. Copy your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

### Step 4: Update Backend CORS

1. Go back to Railway dashboard
2. Update environment variables:
   - `FRONTEND_URL` = Your Vercel frontend URL
   - `CORS_ORIGIN` = Your Vercel frontend URL (same as FRONTEND_URL)
3. Railway will automatically redeploy

### Step 5: Test Deployment

1. Visit your Vercel frontend URL
2. Test all features:
   - Create a drop
   - Make a reservation
   - Complete a purchase
   - Test real-time updates (two browser windows)

## Environment Variables

### Local Development (.env file)

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
PGSSLMODE=require
PORT=4000
VITE_BACKEND_URL=http://localhost:4000
```

### Railway (Backend)

**Required:**
- `DATABASE_URL` - Neon database connection string
- `PGSSLMODE` - `require`

**After Frontend Deployment:**
- `FRONTEND_URL` - Vercel frontend URL
- `CORS_ORIGIN` - Same as FRONTEND_URL

**Optional:**
- `PORT` - Auto-assigned by Railway (can set if needed)

### Vercel (Frontend)

- `VITE_BACKEND_URL` - Railway backend URL

> **Important**: Never commit `.env` files to version control. Use `.env.example` as a template.

## API Endpoints

### Drops
- `GET /api/drops` - Get all active drops with activity feed
- `GET /api/drops/:id` - Get specific drop details
- `POST /api/drops` - Create new drop

### Reservations
- `POST /api/reserve/:dropId` - Reserve item (body: `{userId: number}`)

### Purchases
- `POST /api/purchase/:reservationId` - Complete purchase (body: `{userId: number}`)

### Health Check
- `GET /api/health` - Server health status

## Real-Time Events (WebSocket)

- `stockUpdate`: `{dropId, availableStock}` - Stock changes
- `newPurchase`: `{dropId, userId, username, timestamp}` - New purchases
- `connected`: `{message}` - Connection confirmation

## Database Schema

### Users
- id (Primary Key)
- username (Unique)

### Drops
- id (Primary Key)
- name
- price
- total_stock
- available_stock
- drop_start_time

### Reservations
- id (Primary Key)
- userId (Foreign Key)
- dropId (Foreign Key)
- status (ACTIVE/EXPIRED/PURCHASED)
- expires_at

### Purchases
- id (Primary Key)
- userId (Foreign Key)
- dropId (Foreign Key)

## Testing the System

### 1. Create a Drop
```bash
curl -X POST http://localhost:4000/api/drops \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Air Jordan 1 High OG",
    "price": 200,
    "totalStock": 100
  }'
```

### 2. Get Active Drops
```bash
curl http://localhost:4000/api/drops
```

### 3. Make a Reservation
```bash
curl -X POST http://localhost:4000/api/reserve/1 \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### 4. Complete Purchase
```bash
curl -X POST http://localhost:4000/api/purchase/1 \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

## Troubleshooting

### Backend Connection Issues

**Local:**
- Verify `DATABASE_URL` is correct in `.env`
- Check `PGSSLMODE=require` is set
- Ensure internet connection (Neon is cloud database)
- Test connection string in Neon dashboard

**Railway:**
- Verify environment variables are set correctly
- Check Railway logs for connection errors
- Ensure `DATABASE_URL` has no extra quotes
- Verify `PGSSLMODE=require` is set

### Frontend Issues

**Local:**
- Ensure backend is running on port 4000
- Check browser console (F12) for errors
- Verify `VITE_BACKEND_URL` if set in frontend `.env.local`

**Vercel:**
- Verify `VITE_BACKEND_URL` is set correctly
- Check Vercel build logs for errors
- Ensure Railway backend URL is accessible

### CORS Errors

- Ensure `FRONTEND_URL` and `CORS_ORIGIN` are set in Railway
- Make sure frontend URL includes protocol (https://)
- Check Railway logs for CORS-related errors

### Socket.io Not Connecting

- Verify `VITE_BACKEND_URL` includes protocol (https://)
- Check backend Socket.io CORS configuration
- Ensure Railway backend is running (check logs)
- Check browser console for Socket.io errors

### Railway "No start command found"

1. Go to Railway Dashboard → Your Service → Settings
2. Set **Root Directory** to: `backend`
3. Set **Start Command** to: `npm start` (optional - Railway auto-detects)
4. Save and redeploy

## Development

### Docker Development
- Services automatically restart on code changes (volume mounts)
- Database persists in Docker volume `postgres_data`
- View logs: `docker compose logs -f [service_name]`
- Stop services: `docker compose down`

### Manual Development
- Backend: `npm start` in `backend/` directory
- Frontend: `npm run dev` in `frontend/` directory (Vite hot-reload enabled)
- Database syncs automatically on startup (`alter: true`)

## Notes

- Railway free tier may sleep after inactivity (first request may be slow)
- Vercel frontend is served via CDN (fast globally)
- Neon database is serverless (scales automatically)
- Socket.io connections work with Railway (persistent server)
- All environment variables should be set in deployment platforms (not committed to Git)

## License

ISC
