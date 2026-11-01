@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Game Island - online via shared server

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
if not exist "node_modules\playwright\cli.js" set "NEEDREINSTALL=1"
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
if not exist "node_modules\playwright\cli.js" goto :broken
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


echo.
echo ================================================
echo   Running ALL browser checks ^(reconnect / leave / RWD / UI ...^)
echo   Only some games: pass game ids after the bat name, e.g. whack-a-mole stair-kids
echo   Result file:     docs\verify-last-shared.json
echo   This takes a long time. Progress is printed per script.
echo ================================================
echo.
node scripts\verify-games.js --shared-online --timeout=300 --budget=3600 %*
set RC=%ERRORLEVEL%
echo.
if "%RC%"=="0" (echo ALL PASSED) else (echo Some checks failed, exit code %RC% ^(2 = repeated failure, stop and read docs\verify-last-shared.json^))
pause
exit /b %RC%
