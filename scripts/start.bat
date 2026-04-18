@echo off
echo Starting Aether Campus OS...

:: Start backend
echo Starting Backend (Node.js)...
cd apps\backend
start cmd /k "npm install && npm run dev"

:: Wait for backend
timeout /t 4

:: Start mobile frontend
echo Starting Mobile Frontend (Expo)...
cd ..\mobile
start cmd /k "npm install && npx expo start --go"

echo Aether is running!
echo   Backend:  http://localhost:3000
echo   Expo Go:  Scan the QR code in the Expo window with the Expo Go app
pause
