@echo off
title Aether Campus OS — Launcher
color 0A

echo.
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   ⚡ AETHER CAMPUS OS — Starting All Services
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: ── Backend (Express + Socket.IO) on port 3000 ──
echo  [1/4] Starting Backend API on port 3000...
start "Aether Backend" cmd /k "cd /d %~dp0apps\backend && npm run dev"

:: Wait for backend to start
timeout /t 4 /nobreak >nul

:: ── Super App (Vite) on port 5173 ──
echo  [2/4] Starting Super App on port 5173...
start "Aether Super App" cmd /k "cd /d %~dp0apps\super-app && npm run dev"

:: ── Canteen Tracker (static serve) on port 3001 ──
echo  [3/4] Starting Canteen Tracker on port 3001...
start "Canteen Tracker" cmd /k "cd /d %~dp0apps\canteen-tracker && npx -y serve . -l 3001"

:: ── Mobile (Expo) ──
echo  [4/4] Starting Mobile App (Expo Go)...
start "Aether Mobile" cmd /k "cd /d %~dp0apps\mobile && npx expo start --go --host lan"

:: Wait for all services to spin up
timeout /t 5 /nobreak >nul

:: ── Show status ──
echo.
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   ✅ All services started!
echo.
echo   📡 Backend API:      http://localhost:3000/api/health
echo   🧩 Super App:        http://localhost:5173
echo   🍽️  Canteen Tracker:  http://localhost:3001
echo   📱 Mobile (Expo):    Scan QR in terminal with Expo Go
echo.
echo   🔑 Test Login:
echo      Student:   priyank@aether.edu / aether123
echo      Professor: harshav@aether.edu / aether123
echo      Admin:     admin@aether.edu / aether123
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: Open Super App in browser
start "" "http://localhost:5173"

echo  Press any key to stop all services...
pause >nul

:: Kill all windows
taskkill /f /fi "WINDOWTITLE eq Aether Backend" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq Aether Super App" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq Canteen Tracker" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq Aether Mobile" >nul 2>&1
echo  ⛔ All services stopped.
