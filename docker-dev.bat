@echo off
REM Quiz Management System Frontend - Docker Development Scripts for Windows

setlocal enabledelayedexpansion

REM Function to create network if it doesn't exist
:create_network
docker network ls | findstr "quiz-network" >nul
if %errorlevel% neq 0 (
    echo [INFO] Creating quiz-network...
    docker network create quiz-network
) else (
    echo [INFO] quiz-network already exists
)
goto :eof

REM Development environment
:dev
echo [INFO] Starting development environment...
call :create_network
docker-compose -f docker-compose.dev.yml up --build
goto :eof

REM Production environment
:prod
echo [INFO] Starting production environment...
call :create_network
docker-compose -f docker-compose.prod.yml up --build -d
goto :eof

REM Stop all containers
:stop
echo [INFO] Stopping all containers...
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down
goto :eof

REM Clean up containers and images
:clean
echo [INFO] Cleaning up containers and images...
docker-compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
docker-compose -f docker-compose.prod.yml down --rmi all --volumes --remove-orphans
docker system prune -f
goto :eof

REM Build only
:build
echo [INFO] Building images...
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.prod.yml build
goto :eof

REM Show logs
:logs
if "%2"=="prod" (
    docker-compose -f docker-compose.prod.yml logs -f
) else (
    docker-compose -f docker-compose.dev.yml logs -f
)
goto :eof

REM Show help
:help
echo Quiz Management System Frontend - Docker Helper
echo.
echo Usage: docker-dev.bat [command]
echo.
echo Commands:
echo   dev     Start development environment
echo   prod    Start production environment
echo   stop    Stop all containers
echo   clean   Clean up containers and images
echo   build   Build all images
echo   logs    Show logs (use 'logs prod' for production)
echo   help    Show this help message
goto :eof

REM Main script logic
if "%1"=="dev" goto :dev
if "%1"=="prod" goto :prod
if "%1"=="stop" goto :stop
if "%1"=="clean" goto :clean
if "%1"=="build" goto :build
if "%1"=="logs" goto :logs
goto :help