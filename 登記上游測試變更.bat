@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Approve upstream test changes
node scripts\approve-upstream-tests.js --yes
if errorlevel 1 (echo FAILED & pause & exit /b 1)
git add docs/test-change-allowlist.json
git commit -m "register upstream test changes (identical to originals)" -- docs/test-change-allowlist.json
echo.
echo Done. Now run the browser verification bat.
pause
