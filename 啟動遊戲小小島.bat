@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Game Island - local test

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install from https://nodejs.org/
  pause
  exit /b 1
)

rem Use the npm bundled with Node itself (a broken global npm in AppData\Roaming\npm breaks npm/npx)
set "NPMRUN=npm"
for /f "delims=" %%i in ('where node') do (
  if exist "%%~dpinode_modules\npm\bin\npm-cli.js" (
    set "NPMRUN=node "%%~dpinode_modules\npm\bin\npm-cli.js""
    goto :npmfound
  )
)
:npmfound
echo Using: %NPMRUN%

rem ---- make sure node_modules is complete (a half-installed or scanned folder has packages with no .js files) ----
set "NEEDREINSTALL="
if not exist "node_modules\express\index.js" set "NEEDREINSTALL=1"
if not exist "node_modules\tsx\dist\cli.mjs" set "NEEDREINSTALL=1"
if defined NEEDREINSTALL (
  echo node_modules is missing or incomplete. Doing a clean install ^(a few minutes^)...
  if exist "node_modules" rmdir /s /q "node_modules"
  call %NPMRUN% install --no-audit --no-fund > npm-install.log 2>&1
  if errorlevel 1 (
    type npm-install.log
    echo [ERROR] npm install failed ^(log: npm-install.log^). Send me this output.
    pause
    exit /b 1
  )
)
if not exist "node_modules\express\index.js" goto :broken
if not exist "node_modules\tsx\dist\cli.mjs" goto :broken
goto :installok
:broken
echo [ERROR] After install, files are still missing from node_modules ^(for example express\index.js^).
echo This usually means antivirus / Windows Security is quarantining .js files.
echo Check Windows Security ^> Protection history, and exclude this folder from scanning:
echo   %CD%\node_modules
echo Then run this bat again.
pause
exit /b 1
:installok

rem Vite games (snake-3d, ice-duel): build their front-end once so the shared server can serve it
call node scripts\build-vite-local.js
if errorlevel 1 echo [WARN] A Vite game failed to build; the other games still work.

if "%PORT%"=="" set PORT=3000
echo ================================================
echo   Game Island - shared server ^(all 18 games on one port^)
echo ================================================
echo.
echo   Home:        http://localhost:%PORT%/
echo   One game:    http://localhost:%PORT%/g/GAME-ID/
echo   Health:      http://localhost:%PORT%/health
echo.
echo   Phones/tablets on the same Wi-Fi: replace localhost with this PC's IP.
echo   Close this window to stop the server.
echo.
start "" "http://localhost:%PORT%/"
call node node_modules\tsx\dist\cli.mjs apps\game-server\server.js
echo.
echo Server stopped.
pause
