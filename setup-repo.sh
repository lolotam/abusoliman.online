#!/bin/bash

# ABUSLEMAN-ACC-AA Repository Setup Script
# نص إعداد مستودع نظام أبوسليمان للمحاسبة وإدارة المخزون

echo "🚀 Setting up ABUSLEMAN-ACC-AA repository..."
echo "إعداد مستودع نظام أبوسليمان للمحاسبة وإدارة المخزون..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    print_info "Initializing Git repository..."
    git init
    print_status "Git repository initialized"
else
    print_info "Git repository already exists"
fi

# Create directory structure
print_info "Creating directory structure..."

# Create js directory if it doesn't exist
mkdir -p js
mkdir -p tests
mkdir -p docs
mkdir -p assets/images
mkdir -p assets/icons

print_status "Directory structure created"

# Move files to appropriate directories if they exist
print_info "Organizing files..."

# Move test files to tests directory
if [ -f "test-inventory-categories.js" ]; then
    mv test-inventory-categories.js tests/
    print_status "Moved test files to tests/ directory"
fi

if [ -f "playwright.config.js" ]; then
    mv playwright.config.js tests/
    print_status "Moved Playwright config to tests/ directory"
fi

# Move documentation files to docs directory
if [ -f "README-TESTING.md" ]; then
    mv README-TESTING.md docs/
    print_status "Moved testing documentation to docs/ directory"
fi

if [ -f "analyze-test-results.md" ]; then
    mv analyze-test-results.md docs/
    print_status "Moved analysis documentation to docs/ directory"
fi

# Move analysis scripts to docs directory
if [ -f "run-tests-and-analyze.js" ]; then
    mv run-tests-and-analyze.js docs/
    print_status "Moved analysis scripts to docs/ directory"
fi

if [ -f "quick-test-runner.js" ]; then
    mv quick-test-runner.js docs/
    print_status "Moved test runner to docs/ directory"
fi

# Replace old README with new one
if [ -f "README-NEW.md" ]; then
    mv README-NEW.md README.md
    print_status "Updated README.md with comprehensive documentation"
fi

# Add all files to git
print_info "Adding files to Git..."
git add .

# Check if there are any changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    # Commit with descriptive message
    print_info "Committing files..."
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

    print_status "Files committed successfully"
fi

# Instructions for pushing to GitHub
echo ""
echo "📋 Next steps to push to GitHub:"
echo "الخطوات التالية لرفع الملفات إلى GitHub:"
echo ""
echo "1. Create a new repository on GitHub named 'ABUSLEMAN-ACC-AA'"
echo "   أنشئ مستودع جديد على GitHub باسم 'ABUSLEMAN-ACC-AA'"
echo ""
echo "2. Run the following commands:"
echo "   شغل الأوامر التالية:"
echo ""
echo -e "${BLUE}git remote add origin https://github.com/YOUR_USERNAME/ABUSLEMAN-ACC-AA.git${NC}"
echo -e "${BLUE}git branch -M main${NC}"
echo -e "${BLUE}git push -u origin main${NC}"
echo ""
echo "3. Replace YOUR_USERNAME with your actual GitHub username"
echo "   استبدل YOUR_USERNAME باسم المستخدم الخاص بك على GitHub"
echo ""

# Display repository structure
echo "📁 Repository structure:"
echo "هيكل المستودع:"
echo ""
tree -I 'node_modules|.git' . 2>/dev/null || find . -type f -not -path './node_modules/*' -not -path './.git/*' | head -20

echo ""
print_status "Repository setup completed successfully!"
print_status "تم إعداد المستودع بنجاح!"

echo ""
echo "🧪 To run tests after pushing:"
echo "لتشغيل الاختبارات بعد الرفع:"
echo ""
echo "npm install"
echo "npm run install-browsers"
echo "npm test"
