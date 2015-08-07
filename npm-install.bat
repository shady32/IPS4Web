::npm-install.bat
@echo off
::install web server dependencies && backend server dependencies
cd web-server && npm install -d && cd .. && cd backend-server && npm install -d