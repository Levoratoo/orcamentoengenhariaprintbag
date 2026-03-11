@echo off
cd /d "%~dp0.."
call npm run pm2:start
