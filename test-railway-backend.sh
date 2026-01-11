#!/bin/bash

RAILWAY_URL="https://real-time-high-traffic-inventory-system-production.up.railway.app"

echo "Testing Railway Backend..."
echo ""

echo "1. Testing Health Endpoint:"
echo "   $RAILWAY_URL/api/health"
curl -s "$RAILWAY_URL/api/health" | jq . 2>/dev/null || curl -s "$RAILWAY_URL/api/health"
echo ""
echo ""

echo "2. Testing Drops Endpoint:"
echo "   $RAILWAY_URL/api/drops"
curl -s "$RAILWAY_URL/api/drops" | jq . 2>/dev/null || curl -s "$RAILWAY_URL/api/drops"
echo ""
echo ""

echo "✅ If you see JSON responses above, your backend is working!"
echo ""
echo "❌ If you see errors, check Railway logs in the dashboard"
