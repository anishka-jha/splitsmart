@echo off
setlocal
cd /d "%~dp0"
set "SPLITSMART_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%SPLITSMART_NODE%" set "SPLITSMART_NODE=node"
if not exist "node_modules\vite\bin\vite.js" (
 echo Dependencies are missing. Install Node.js, then run npm install in this folder.
 pause
 exit /b 1
)
echo Keep this window open while using SplitSmart.
echo Open the Local address printed below in your browser.
"%SPLITSMART_NODE%" --preserve-symlinks node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5195 --open
pause

