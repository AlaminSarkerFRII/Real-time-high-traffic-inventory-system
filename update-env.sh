#!/bin/bash
# Update .env with correct Neon connection string

ENV_FILE=".env"
BACKUP_FILE=".env.backup"

# Backup current .env
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo "✓ Backed up .env to .env.backup"
fi

# Update DATABASE_URL
cat > "$ENV_FILE" << 'ENVEOF'
# ============================================
# PRODUCTION CONFIGURATION (Neon Database)
# ============================================
# Neon Database Connection String (for production deployment)
DATABASE_URL=postgresql://neondb_owner:npg_BxAQq6XRrgZ5@ep-winter-shape-ahbagj0q-pooler.c-3.us-east-1.aws.neon.tech/inventory_db?sslmode=require&channel_binding=require
PGSSLMODE=require
PORT=4000

# ============================================
# LOCAL DEVELOPMENT CONFIGURATION (Docker)
# ============================================
# Database Configuration (commented for local Docker setup)
# POSTGRES_DB=inventory_db
# POSTGRES_USER=alamin
# POSTGRES_PASSWORD=password
# POSTGRES_HOST=postgres
# POSTGRES_PORT=5432

# Local Docker Database URL (commented - use Neon for production)
# DATABASE_URL=postgresql://alamin:password@postgres:5432/inventory_db
# PGSSLMODE=disable

# ============================================
# FRONTEND CONFIGURATION
# ============================================
# Backend API URL (for local development)
# Will be overridden in Vercel with production backend URL
VITE_BACKEND_URL=http://localhost:4000
ENVEOF

echo "✓ Updated .env file with correct Neon connection string"
echo ""
echo "Connection string:"
grep "^DATABASE_URL=" "$ENV_FILE" | head -1
