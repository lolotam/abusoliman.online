@echo off
REM ABUSLEMAN POS System - Quick Start Script for Windows
REM نظام أبوسليمان لنقاط البيع - سكريبت البدء السريع لـ Windows

setlocal enabledelayedexpansion

echo.
echo 🏪 ABUSLEMAN POS System - Quick Start
echo نظام أبوسليمان لنقاط البيع - البدء السريع
echo ========================================
echo.

REM Check if Docker is installed
echo [INFO] Checking prerequisites...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    echo [ERROR] Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo [SUCCESS] All prerequisites are met!
echo.

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "data" mkdir data
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups
if not exist "ssl" mkdir ssl
echo [SUCCESS] Directories created successfully!
echo.

REM Stop any existing containers
echo [INFO] Stopping any existing containers...
docker-compose down >nul 2>&1

REM Build and start the application
echo [INFO] Building and starting ABUSLEMAN POS System...
docker-compose up -d --build
if errorlevel 1 (
    echo [ERROR] Failed to start the application. Please check Docker logs.
    pause
    exit /b 1
)

echo [SUCCESS] Application started successfully!
echo.

REM Wait for application to be ready
echo [INFO] Waiting for application to be ready...
set /a attempts=0
set /a max_attempts=30

:wait_loop
set /a attempts+=1
if !attempts! gtr !max_attempts! goto timeout

timeout /t 2 /nobreak >nul
curl -f http://localhost:8080/health >nul 2>&1
if errorlevel 1 (
    echo [INFO] Attempt !attempts!/!max_attempts! - waiting for application...
    goto wait_loop
)

echo [SUCCESS] Application is ready!
goto show_info

:timeout
echo [WARNING] Application may not be fully ready yet. Please check manually.

:show_info
echo.
echo 🎉 ABUSLEMAN POS System is now running!
echo نظام أبوسليمان لنقاط البيع يعمل الآن!
echo.
echo 📍 Access URLs:
echo    • Main Application: http://localhost:8080
echo    • Health Check: http://localhost:8080/health
echo.
echo 🔑 Default Login:
echo    • Username: admin
echo    • Password: 123
echo.
echo 📚 Documentation:
echo    • README: README.md
echo    • Docker Guide: DOCKER_DEPLOYMENT.md
echo    • Requirements: requirments.md
echo.
echo 🛠️ Useful Commands:
echo    • View logs: docker-compose logs -f
echo    • Stop system: docker-compose down
echo    • Restart: docker-compose restart
echo    • Update: git pull ^&^& docker-compose up -d --build
echo.
echo [SUCCESS] Setup completed successfully! Enjoy using ABUSLEMAN POS System!
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open the application in default browser
start http://localhost:8080

echo.
echo Application opened in your default browser.
echo Press any key to exit...
pause >nul
