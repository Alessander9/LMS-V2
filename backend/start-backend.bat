@echo off
if "%DB_URL%"=="" set DB_URL=jdbc:postgresql://localhost:5455/nuevo_proyecto_db
if "%DB_USERNAME%"=="" set DB_USERNAME=nuevo_proyecto_user
if "%DB_PASSWORD%"=="" set DB_PASSWORD=nuevo_proyecto_password
if "%JWT_SECRET%"=="" set JWT_SECRET=N82p03maxv8rOuuQA+LhqlztHymFQ3PtBsAJi+xxsok=
if "%JWT_EXPIRATION%"=="" set JWT_EXPIRATION=1800000
if "%API_BASE_URL%"=="" set API_BASE_URL=http://localhost:8081
if "%FRONTEND_BASE_URL%"=="" set FRONTEND_BASE_URL=http://localhost:4200
if "%STORAGE_PATH%"=="" set STORAGE_PATH=uploads
if "%CORS_ALLOWED_ORIGINS%"=="" set CORS_ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
if "%SEED_DEFAULT_USERS%"=="" set SEED_DEFAULT_USERS=true

cd /d "%~dp0"
start /B .\mvnw.cmd spring-boot:run -q > ..\run-logs\backend-current.out.log 2> ..\run-logs\backend-current.err.log
echo Backend iniciado en segundo plano.
