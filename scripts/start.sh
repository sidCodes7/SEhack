#!/bin/bash
set -e

echo "🚀 Starting Aether Campus OS..."

# Start backend
echo "📡 Starting Backend (Node.js)..."
cd apps/backend
npm install
npm run dev &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Start mobile frontend
echo "📱 Starting Mobile Frontend (Expo)..."
cd ../mobile
npm install
npx expo start --go &
FRONTEND_PID=$!

echo "✅ Aether is running!"
echo "   Backend:  http://localhost:3000"
echo "   Expo Go:  Scan the QR code above with the Expo Go app"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '⛔ Aether stopped.'" EXIT
wait
