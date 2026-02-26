# نظام إدارة المخزون والمحاسبة - أبوسليمان
# ABUSLEMAN Arabic Inventory Management & Accounting System

<div align="center">

![Arabic](https://img.shields.io/badge/Language-Arabic-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Supported-blue?logo=docker)
![Playwright](https://img.shields.io/badge/Testing-Playwright-blue)

**نظام شامل لإدارة المخزون ونقاط البيع باللغة العربية**

[العربية](#العربية) | [English](#english)

</div>

---

## العربية

### 📋 نظرة عامة

نظام إدارة المخزون والمحاسبة أبوسليمان هو نظام شامل مصمم خصيصاً للشركات العربية. يوفر النظام واجهة مستخدم باللغة العربية مع دعم كامل للاتجاه من اليمين إلى اليسار (RTL). يعمل النظام بالكامل على جانب العميل (Client-Side) دون الحاجة إلى خادم خلفي، مع تخزين جميع البيانات في LocalStorage المتصفح.

### أهداف النظام

- **سهولة الاستخدام**: واجهة عربية بديهية مع دعم RTL كامل
- **لا حاجة لخادم**: نظام يعمل بالكامل على المتصفح
- **نشر سهل**: دعم Docker للنشر بضغطة واحدة
- **تعدد المستخدمين**: نظام صلاحيات (مدير، مدير مخزن، كاشير، مشاهد)
- **تعدد المخازن**: إدارة المخزون عبر عدة مخازن

### ✨ الميزات الرئيسية

#### 🏪 نقطة البيع (POS)
- واجهة بيع سهلة الاستخدام
- دعم متعدد المخازن
- خصم تلقائي للمخزون
- إدارة العملاء والموردين
- طباعة الفواتير

#### 📦 إدارة المخزون
- تتبع المخزون عبر مخازن متعددة
- تنبيهات المخزون المنخفض
- توزيع المنتجات على المخازن
- تقارير مخزون مفصلة
- حركات المخزون الكاملة

#### 🧾 نظام الفواتير
- فواتير مبيعات ومشتريات
- ترقيم تلقائي: ABUSLEAN-SALE-XX / ABUSLEAN-PUR-XX
- تعديل أرقام الفواتير
- تصدير البيانات إلى JSON

#### 👥 إدارة العملاء والموردين
- سجلات كاملة للعملاء والموردين
- تتبع أرصدة العملاء
- سجل المعاملات

#### 📊 التقارير
- تقارير المبيعات
- تقارير العملاء والموردين
- تقارير المخزون التفصيلية
- تصدير إلى JSON

#### 🏷️ إدارة الفئات
- 16 فئة منتج شاملة باللغة العربية
- تزامن الفئات عبر النظام
- إضافة وتعديل الفئات
- فلترة المنتجات حسب الفئة

#### ⚙️ الإعدادات
- إعدادات الشركة
- إدارة المستخدمين والصلاحيات
- تغيير كلمة المرور
- النسخ الاحتياطي واستعادة البيانات
- دعم الوضع الليلي

### 🛠️ التقنيات المستخدمة

#### الواجهة الأمامية
- **HTML5**: بنية الصفحات والدلالات
- **CSS3**: التصميم المتجاوب مع دعم RTL
- **JavaScript ES6+**: المنطق البرمجي
- **Font Awesome**: الأيقونات
- **Google Fonts (Cairo)**: الخطوط العربية

#### التخزين
- **Browser LocalStorage**: تخزين البيانات محلياً
- **Database Class**: فئة مخصصة لإدارة البيانات بنمط SQL

#### الخادم (للتطوير/الإنتاج)
- **Python HTTP Server**: خادم بسيط للتطوير
- **Node.js (serve)**: خادم بديل
- **PHP Built-in Server**: خادم بديل
- **Nginx**: خادم الإنتاج الموصى به
- **Docker**: للتغليف والنشر السهل

### 🚀 التثبيت والتشغيل

#### المتطلبات
- متصفح ويب حديث (Chrome, Firefox, Edge, Safari)
- Docker (اختياري، للنشر السهل)
- أو خادم ويب محلي (Python, Node.js, أو PHP)

#### الطريقة الأولى: Docker (موصى بها)

```bash
# استنساخ المستودع
git clone https://github.com/[username]/ABUSLEMAN-ACC-AA.git
cd ABUSLEMAN-ACC-AA

# باستخدام Docker Compose (الأسهل)
docker-compose up -d

# أو بناء وتشغيل يدوياً
docker build -t abusleman-inventory .
docker run -p 3000:80 abusleman-inventory
```

#### الطريقة الثانية: خادم محلي

```bash
# استنساخ المستودع
git clone https://github.com/[username]/ABUSLEMAN-ACC-AA.git
cd ABUSLEMAN-ACC-AA

# تشغيل خادم محلي
python -m http.server 3000
# أو
npx serve .
# أو
php -S localhost:3000
```

#### الوصول للنظام
افتح المتصفح وانتقل إلى: `http://localhost:3000`

#### بيانات الدخول الافتراضية
- اسم المستخدم: `admin`
- كلمة المرور: `@Xx123456789xX@`

### 📁 هيكل المشروع

```
ABUSLEMAN-ACC-AA/
├── index.html              # الصفحة الرئيسية
├── style.css              # ملف الأنماط الرئيسي
├── database.js            # إدارة قاعدة البيانات
├── main.js                # الملف الرئيسي
├── app.js                 # منطق التطبيق الأساسي
├── sample-data.js         # بيانات تجريبية
├── Dockerfile             # تكوين Docker
├── docker-compose.yml     # Docker Compose
├── nginx.conf             # تكوين Nginx
├── js/                    # ملفات JavaScript
│   ├── dashboard.js       # لوحة المعلومات
│   ├── sales.js           # نقطة البيع
│   ├── products.js        # إدارة المنتجات
│   ├── categories.js      # إدارة الفئات
│   ├── purchases.js       # المشتريات
│   ├── customers.js       # العملاء
│   ├── suppliers.js       # الموردين
│   ├── reports.js         # التقارير
│   └── settings.js        # الإعدادات
├── tests/                 # اختبارات Playwright
├── docs/                  # الوثائق
└── package.json           # إعدادات Node.js
```

### 📚 مرجع فئات البرمجيات (JavaScript Modules)

#### database.js
فئة `Database` - إدارة قاعدة البيانات المحلية
- `createTable()` - إنشاء جدول جديد
- `getTable()` - جلب البيانات من جدول
- `setTable()` - حفظ البيانات في جدول
- `insert()` / `addRecord()` - إضافة سجل جديد
- `update()` / `updateRecord()` - تحديث سجل
- `delete()` / `deleteRecord()` - حذف سجل
- `findById()` - البحث بالمعرف
- `find()` - بحث بشروط مخصصة
- `generateInvoiceNumber()` - توليد رقم فاتورة
- `formatCurrency()` - تنسيق العملة
- `formatDate()` - تنسيق التاريخ
- `exportData()` - تصدير البيانات
- `importData()` - استيراد البيانات

#### main.js
تهيئة التطبيق والوظائف الأساسية
- تهيئة قاعدة البيانات
- إدارة التنقل بين الصفحات
- الوظائف المساعدة

#### app.js
منطق التطبيق الأساسي
- نظام المصادقة
- إدارة الجلسات
- إدارة المستخدمين

#### js/dashboard.js
لوحة المعلومات والإحصائيات
- إحصائيات المبيعات
- تنبيهات المخزون
- الرسوم البيانية

#### js/sales.js
نقطة البيع (POS)
- إنشاء فواتير المبيعات
- إدارة سلة التسوق
- خصم المخزون تلقائياً

#### js/purchases.js
إدارة المشتريات
- إنشاء فواتير المشتريات
- إضافة المخزون تلقائياً

#### js/products.js
إدارة المنتجات
- إضافة وتعديل المنتجات
- توزيع المخزون على المخازن

#### js/categories.js
إدارة الفئات
- إضافة وتعديل الفئات
- تزامن الفئات عبر النظام

#### js/settings.js
إعدادات النظام
- إعدادات الشركة
- إدارة المستخدمين
- النسخ الاحتياطي

#### js/reports.js
التقارير والإحصائيات
- تقارير المبيعات
- تقارير المخزون
- تقارير العملاء

### 🗄️ هيكل قاعدة البيانات

الجداول الرئيسية في LocalStorage:

| الجدول | الوصف |
|--------|-------|
| `settings` | إعدادات النظام والشركة |
| `users` | مستخدمي النظام |
| `products` | المنتجات والمخزون |
| `customers` | العملاء |
| `suppliers` | الموردين |
| `sales` | فواتير المبيعات |
| `purchases` | فواتير المشتريات |
| `payments` | المدفوعات |
| `categories` | فئات المنتجات |
| `warehouses` | المخازن |
| `inventory_movements` | حركات المخزون |

### 🧪 الاختبارات

#### تثبيت أدوات الاختبار
```bash
npm install
npm run install-browsers
```

#### تشغيل الاختبارات
```bash
# اختبار شامل
npm test

# اختبار مع عرض المتصفح
npm run test:headed

# اختبار تفاعلي
npm run test:ui

# اختبار المخزون والفئات
npm run test:inventory
```

### 🌍 اللغة والتوطين

- اللغة الأساسية: العربية
- اتجاه النص: RTL (من اليمين إلى اليسار)
- تنسيق الأرقام: أرقام عربية
- تنسيق التاريخ: تقويم هجري/ميلادي
- العملة الافتراضية: دينار كويتي (د.ك)

### 🔧 الإصلاحات الأخيرة

#### ✅ خصم المخزون التلقائي
- إصلاح خصم المخزون عند إنشاء فواتير البيع
- تحديث تلقائي للمخزون الكلي ومخزون المخزن المحدد
- رسائل تأكيد وتحقق من نجاح العملية

#### ✅ تزامن الفئات
- إصلاح عرض الفئات في قسم المنتجات
- تزامن فوري بين الإعدادات وجميع أقسام النظام
- دعم إضافة فئات جديدة بدون إعادة تحميل

### 💡 الاستخدام

#### إعداد النظام الأولي
1. افتح النظام في المتصفح
2. سجل الدخول باستخدام الحساب الافتراضي
3. انتقل إلى قسم الإعدادات
4. أدخل معلومات الشركة
5. أضف المخازن والفئات حسب الحاجة
6. أنشئ مستخدمين إضافيين

#### إضافة المنتجات
1. انتقل إلى قسم المنتجات
2. اضغط "إضافة منتج"
3. املأ البيانات المطلوبة
4. حدد توزيع المخازن
5. احفظ المنتج

#### استخدام نقطة البيع
1. انتقل إلى قسم المبيعات
2. اختر المخزن
3. أضف المنتجات إلى السلة
4. اختر العميل
5. أكمل عملية البيع

### 🔒 اعتبارات الأمان

- كلمات المرور مخزنة في LocalStorage (نظام محلي)
- يوصى باستخدام HTTPS في الإنتاج
- لا يوجد اتصال بالخادم - جميع البيانات محلية
- دعم صلاحيات المستخدمين المختلفة

### 🐛 استكشاف الأخطاء

#### المشكلة: لا يتم حفظ البيانات
- تحقق من إعدادات المتصفح
- تأكد من تفعيل LocalStorage

#### المشكلة: Docker container لا يعمل
```bash
# سجلات الحاوية
docker logs abusleman-inventory

# إعادة البناء
docker-compose build --no-cache
```

#### المشكلة: تنبيهات المخزون لا تظهر
- تحقق من إعدادات حد المخزون المنخفض
- تأكد من توزيع المخزون على المخازن

### 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. عمل Fork للمستودع
2. إنشاء فرع جديد للميزة
3. إجراء التغييرات
4. إرسال Pull Request

### 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

### 📞 الدعم

للدعم والاستفسارات:
- إنشاء Issue في GitHub
- مراجعة الوثائق في مجلد `docs/`

---

## English

### 📋 Overview

ABUSLEMAN Arabic Inventory Management & Accounting System is a comprehensive solution designed specifically for Arabic businesses. The system provides a fully Arabic user interface with complete Right-to-Left (RTL) support. It operates entirely on the client-side without requiring a backend server, storing all data in the browser's LocalStorage.

### System Goals

- **Ease of Use**: Intuitive Arabic interface with full RTL support
- **Serverless**: Fully client-side system
- **Easy Deployment**: Docker support for one-command deployment
- **Multi-user**: Role-based permissions (admin, manager, cashier, viewer)
- **Multi-warehouse**: Inventory management across multiple warehouses

### ✨ Key Features

#### 🏪 Point of Sale (POS)
- Easy-to-use sales interface
- Multi-warehouse support
- Automatic inventory deduction
- Customer and supplier management
- Invoice printing

#### 📦 Inventory Management
- Multi-warehouse inventory tracking
- Low stock alerts
- Product distribution across warehouses
- Detailed inventory reports
- Complete inventory movement tracking

#### 🧾 Invoice System
- Sales and purchase invoices
- Auto-numbering: ABUSLEAN-SALE-XX / ABUSLEAN-PUR-XX
- Invoice number editing
- JSON data export

#### 👥 Customer & Supplier Management
- Complete customer and supplier records
- Customer balance tracking
- Transaction history

#### 📊 Reporting
- Sales reports
- Customer and supplier reports
- Detailed inventory reports
- JSON export

#### 🏷️ Category Management
- 16 comprehensive Arabic product categories
- Category synchronization across system
- Add/edit categories
- Filter products by category

#### ⚙️ Settings
- Company settings
- User management and permissions
- Password change
- Data backup and restore
- Dark mode support

### 🛠️ Technology Stack

#### Frontend
- **HTML5**: Structure and semantics
- **CSS3**: Responsive design with RTL support
- **JavaScript ES6+**: Application logic
- **Font Awesome**: Icons
- **Google Fonts (Cairo)**: Arabic typography

#### Storage
- **Browser LocalStorage**: Local data persistence
- **Database Class**: Custom SQL-like data management

#### Server (Development/Production)
- **Python HTTP Server**: Simple development server
- **Node.js (serve)**: Alternative server
- **PHP Built-in Server**: Alternative server
- **Nginx**: Recommended production server
- **Docker**: Easy containerization and deployment

### 🚀 Quick Start

#### Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Docker (optional, for easy deployment)
- Or a local web server (Python, Node.js, or PHP)

#### Method 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/[username]/ABUSLEMAN-ACC-AA.git
cd ABUSLEMAN-ACC-AA

# Using Docker Compose (easiest)
docker-compose up -d

# Or build and run manually
docker build -t abusleman-inventory .
docker run -p 3000:80 abusleman-inventory
```

#### Method 2: Local Server

```bash
# Clone the repository
git clone https://github.com/[username]/ABUSLEMAN-ACC-AA.git
cd ABUSLEMAN-ACC-AA

# Start a local server
python -m http.server 3000
# or
npx serve .
# or
php -S localhost:3000
```

#### Access the Application
Open your browser and navigate to: `http://localhost:3000`

#### Default Login Credentials
- Username: `admin`
- Password: `@Xx123456789xX@`

### 📁 Project Structure

```
ABUSLEMAN-ACC-AA/
├── index.html              # Main application file
├── style.css              # Main stylesheet
├── database.js            # Database management
├── main.js                # Main application file
├── app.js                 # Core application logic
├── sample-data.js         # Sample data
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose
├── nginx.conf             # Nginx configuration
├── js/                    # JavaScript modules
│   ├── dashboard.js       # Dashboard
│   ├── sales.js           # Point of Sale
│   ├── products.js        # Product management
│   ├── categories.js      # Category management
│   ├── purchases.js       # Purchase management
│   ├── customers.js       # Customer management
│   ├── suppliers.js       # Supplier management
│   ├── reports.js         # Reports
│   └── settings.js        # Settings
├── tests/                 # Playwright tests
├── docs/                  # Documentation
└── package.json           # Node.js configuration
```

### 📚 JavaScript Module Reference

#### database.js
`Database` Class - Local database management
- `createTable()` - Create new table
- `getTable()` - Fetch table data
- `setTable()` - Save table data
- `insert()` / `addRecord()` - Add new record
- `update()` / `updateRecord()` - Update record
- `delete()` / `deleteRecord()` - Delete record
- `findById()` - Find by ID
- `find()` - Search with conditions
- `generateInvoiceNumber()` - Generate invoice number
- `formatCurrency()` - Format currency
- `formatDate()` - Format date
- `exportData()` - Export data
- `importData()` - Import data

#### main.js
Application initialization and core functions
- Database initialization
- Navigation management
- Helper functions

#### app.js
Core application logic
- Authentication system
- Session management
- User management

#### js/dashboard.js
Dashboard and statistics
- Sales statistics
- Stock alerts
- Charts and graphs

#### js/sales.js
Point of Sale (POS)
- Create sales invoices
- Shopping cart management
- Auto-deduct inventory

#### js/purchases.js
Purchase management
- Create purchase invoices
- Auto-add inventory

#### js/products.js
Product management
- Add/edit products
- Warehouse distribution

#### js/categories.js
Category management
- Add/edit categories
- Category synchronization

#### js/settings.js
System settings
- Company settings
- User management
- Data backup

#### js/reports.js
Reports and analytics
- Sales reports
- Inventory reports
- Customer reports

### 🗄️ Database Schema

Main tables in LocalStorage:

| Table | Description |
|-------|-------------|
| `settings` | System and company settings |
| `users` | System users |
| `products` | Products and inventory |
| `customers` | Customers |
| `suppliers` | Suppliers |
| `sales` | Sales invoices |
| `purchases` | Purchase invoices |
| `payments` | Payments |
| `categories` | Product categories |
| `warehouses` | Warehouses |
| `inventory_movements` | Inventory movements |

### 🧪 Testing

#### Install test dependencies
```bash
npm install
npm run install-browsers
```

#### Run tests
```bash
# Full test suite
npm test

# With visible browser
npm run test:headed

# Interactive test runner
npm run test:ui

# Inventory and categories tests
npm run test:inventory
```

### 🌍 Language & Localization

- Primary Language: Arabic
- Text Direction: RTL (Right-to-Left)
- Number Format: Arabic numerals
- Date Format: Hijri/Gregorian calendar
- Default Currency: Kuwaiti Dinar (KWD)

### 🔧 Recent Fixes

#### ✅ Automatic Inventory Deduction
- Fixed inventory deduction on sales
- Auto-update total and warehouse stock
- Confirmation messages and success verification

#### ✅ Category Synchronization
- Fixed category display in products section
- Real-time sync between settings and all sections
- Support for adding new categories without reload

### 💡 Usage Guide

#### Initial Setup
1. Open the system in your browser
2. Login with default credentials
3. Go to Settings section
4. Enter company information
5. Add warehouses and categories as needed
6. Create additional users

#### Adding Products
1. Go to Products section
2. Click "Add Product"
3. Fill required fields
4. Specify warehouse distribution
5. Save the product

#### Using Point of Sale
1. Go to Sales section
2. Select warehouse
3. Add products to cart
4. Select customer
5. Complete the sale

### 🔒 Security Considerations

- Passwords stored in LocalStorage (local system)
- HTTPS recommended for production
- No server connection - all data is local
- Role-based user permissions supported

### 🐛 Troubleshooting

#### Issue: Data not saving
- Check browser settings
- Ensure LocalStorage is enabled

#### Issue: Docker container not working
```bash
# Check container logs
docker logs abusleman-inventory

# Rebuild without cache
docker-compose build --no-cache
```

#### Issue: Stock alerts not showing
- Check low stock threshold settings
- Ensure inventory is distributed to warehouses

### 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a Pull Request

### 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

### 📞 Support

For support and inquiries:
- Create an Issue on GitHub
- Check documentation in `docs/` folder

---

<div align="center">

**Made with ❤️ for Arabic businesses**

[⬆ Back to top](#نظام-إدارة-المخزون-والمحاسبة---أبوسليمان)

</div>
