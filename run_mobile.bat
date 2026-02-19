@echo off
set "API_KEY=%1"

if "%API_KEY%"=="" (
    echo Usage: run_mobile.bat YOUR_API_KEY [app_folder]
    echo Example: run_mobile.bat AIzaSy... mobile
    echo.
    echo Default app_folder is 'mobile' (Supervisor App).
    echo Use 'mobile_operator' for Operator App.
    exit /b 1
)

set "APP_FOLDER=%2"
if "%APP_FOLDER%"=="" set "APP_FOLDER=mobile"

echo Starting %APP_FOLDER% with API Key...
cd %APP_FOLDER%
flutter run --dart-define=FIREBASE_API_KEY=%API_KEY%
cd ..
