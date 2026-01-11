#!/bin/bash

echo "======================================"
echo "Local Testing Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
echo -e "${YELLOW}1. Checking .env file...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    if grep -q "DATABASE_URL=postgresql://" .env; then
        echo -e "${GREEN}✓ DATABASE_URL is set${NC}"
    else
        echo -e "${RED}✗ DATABASE_URL not found in .env${NC}"
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi

echo ""

# Check backend dependencies
echo -e "${YELLOW}2. Checking backend dependencies...${NC}"
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓ Backend node_modules exists${NC}"
else
    echo -e "${YELLOW}! Backend node_modules not found${NC}"
    echo "Run: cd backend && npm install"
fi

# Check frontend dependencies
echo -e "${YELLOW}3. Checking frontend dependencies...${NC}"
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Frontend node_modules exists${NC}"
else
    echo -e "${YELLOW}! Frontend node_modules not found${NC}"
    echo "Run: cd frontend && npm install"
fi

echo ""
echo "======================================"
echo "Next Steps:"
echo "======================================"
echo "1. Install dependencies if needed:"
echo "   cd backend && npm install"
echo "   cd frontend && npm install"
echo ""
echo "2. Start backend (in one terminal):"
echo "   cd backend && npm start"
echo ""
echo "3. Start frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open browser: http://localhost:5173"
echo ""
echo "See LOCAL_TESTING.md for detailed instructions"
echo "======================================"
