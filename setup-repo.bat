@echo off
chcp 65001 >nul
echo 🚀 Setting up ABUSLEMAN-ACC-AA repository...
echo إعداد مستودع نظام أبوسليمان للمحاسبة وإدارة المخزون...
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Initialize git repository if not already initialized
if not exist ".git" (
    echo ℹ️ Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ℹ️ Git repository already exists
)

echo.
echo ℹ️ Creating directory structure...

REM Create directories
if not exist "js" mkdir js
if not exist "tests" mkdir tests
if not exist "docs" mkdir docs
if not exist "assets" mkdir assets
if not exist "assets\images" mkdir assets\images
if not exist "assets\icons" mkdir assets\icons

echo ✅ Directory structure created

echo.
echo ℹ️ Organizing files...

REM Move test files to tests directory
if exist "test-inventory-categories.js" (
    move "test-inventory-categories.js" "tests\" >nul
    echo ✅ Moved test files to tests\ directory
)

if exist "playwright.config.js" (
    move "playwright.config.js" "tests\" >nul
    echo ✅ Moved Playwright config to tests\ directory
)

REM Move documentation files to docs directory
if exist "README-TESTING.md" (
    move "README-TESTING.md" "docs\" >nul
    echo ✅ Moved testing documentation to docs\ directory
)

if exist "analyze-test-results.md" (
    move "analyze-test-results.md" "docs\" >nul
    echo ✅ Moved analysis documentation to docs\ directory
)

REM Move analysis scripts to docs directory
if exist "run-tests-and-analyze.js" (
    move "run-tests-and-analyze.js" "docs\" >nul
    echo ✅ Moved analysis scripts to docs\ directory
)

if exist "quick-test-runner.js" (
    move "quick-test-runner.js" "docs\" >nul
    echo ✅ Moved test runner to docs\ directory
)

REM Replace old README with new one
if exist "README-NEW.md" (
    if exist "README.md" del "README.md"
    ren "README-NEW.md" "README.md"
    echo ✅ Updated README.md with comprehensive documentation
)

echo.
echo ℹ️ Adding files to Git...
git add .

REM Check if there are any changes to commit
git diff --staged --quiet
if errorlevel 1 (
    echo ℹ️ Committing files...
    git commit -m "Initial commit: Arabic inventory management system with automated testing

Features:
- Complete POS system with multi-warehouse support
- Automatic inventory deduction and tracking
- 16 comprehensive Arabic product categories
- Real-time category synchronization
- Invoice management with ABUSLEAN numbering
- Comprehensive reporting system
- Playwright automated testing suite
- Full Arabic RTL interface

Recent fixes:
- ✅ Fixed automatic inventory deduction in POS
- ✅ Fixed category filter synchronization
- ✅ Added comprehensive test suite
- ✅ Improved error handling and validation"

    echo ✅ Files committed successfully
) else (
    echo ⚠️ No changes to commit
)

echo.
echo 📋 Next steps to push to GitHub:
echo الخطوات التالية لرفع الملفات إلى GitHub:
echo.
echo 1. Create a new repository on GitHub named 'ABUSLEMAN-ACC-AA'
echo    أنشئ مستودع جديد على GitHub باسم 'ABUSLEMAN-ACC-AA'
echo.
echo 2. Run the following commands:
echo    شغل الأوامر التالية:
echo.
echo git remote add origin https://github.com/YOUR_USERNAME/ABUSLEMAN-ACC-AA.git
echo git branch -M main
echo git push -u origin main
echo.
echo 3. Replace YOUR_USERNAME with your actual GitHub username
echo    استبدل YOUR_USERNAME باسم المستخدم الخاص بك على GitHub
echo.

echo 📁 Repository structure:
echo هيكل المستودع:
echo.
dir /b

echo.
echo ✅ Repository setup completed successfully!
echo ✅ تم إعداد المستودع بنجاح!
echo.
echo 🧪 To run tests after pushing:
echo لتشغيل الاختبارات بعد الرفع:
echo.
echo npm install
echo npm run install-browsers
echo npm test
echo.
pause
