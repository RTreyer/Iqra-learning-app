@echo off
title Iqra - App starten (Handy)
cd /d "%~dp0artifacts\learn-app"

where node >nul 2>nul || (
  echo Node.js wurde nicht gefunden. Bitte Node.js installieren: https://nodejs.org
  pause
  exit /b 1
)

if not exist "..\..\node_modules\expo\bin\cli" (
  echo Pakete fehlen - bitte einmal im Projektordner "npx pnpm@10.34.6 install" ausfuehren.
  pause
  exit /b 1
)

echo Expo Go auf dem Handy oeffnen und den QR-Code scannen (gleiches WLAN).
echo Zum Beenden dieses Fenster schliessen oder Strg+C druecken.
echo.
node ..\..\node_modules\expo\bin\cli start
pause
