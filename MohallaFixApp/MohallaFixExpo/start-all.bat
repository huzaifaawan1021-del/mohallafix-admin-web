@echo off
title MohallaFix Full Stack Launcher
echo Starting Backend Server...
start cmd /k "cd /d D:\Mohalla Fix\backend && npm run dev"
timeout /t 3
echo Starting MohallaFix Expo App...
start cmd /k "cd /d D:\Mohalla Fix\MohallaFixApp\MohallaFixExpo && npx expo start -c"
pause.\start-all.bat