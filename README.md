# نظام إدارة المخزون والمحاسبة - أبوسليمان
# ABUSLEMAN Arabic Inventory Management & Accounting System

<div align="center">

![Arabic](https://img.shields.io/badge/Language-Arabic-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Playwright](https://img.shields.io/badge/Testing-Playwright-blue)

**نظام شامل لإدارة المخزون ونقاط البيع باللغة العربية**

[العربية](#العربية) | [English](#english)

</div>

---

## العربية

### 📋 نظرة عامة

نظام إدارة المخزون والمحاسبة أبوسليمان هو نظام شامل مصمم خصيصاً للشركات العربية. يوفر النظام واجهة مستخدم باللغة العربية مع دعم كامل للاتجاه من اليمين إلى اليسار (RTL).

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

#### 🧾 نظام الفواتير
- فواتير مبيعات ومشتريات
- ترقيم تلقائي: ABUSLEAN-SALE-XX / ABUSLEAN-PUR-XX
- تعديل أرقام الفواتير
- تصدير البيانات

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

### 🚀 التثبيت والتشغيل

#### المتطلبات
- متصفح ويب حديث
- خادم ويب محلي (Python, Node.js, أو أي خادم آخر)

#### خطوات التشغيل
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

### 📁 هيكل المشروع

```
ABUSLEMAN-ACC-AA/
├── index.html              # الصفحة الرئيسية
├── style.css              # ملف الأنماط الرئيسي
├── js/                    # ملفات JavaScript
│   ├── main.js           # الملف الرئيسي
│   ├── database.js       # إدارة قاعدة البيانات
│   ├── sales.js          # نقطة البيع
│   ├── products.js       # إدارة المنتجات
│   ├── categories.js     # إدارة الفئات
│   ├── purchases.js      # المشتريات
│   ├── customers.js      # العملاء
│   ├── suppliers.js      # الموردين
│   ├── reports.js        # التقارير
│   └── settings.js       # الإعدادات
├── tests/                 # اختبارات Playwright
│   ├── test-inventory-categories.js
│   └── playwright.config.js
├── docs/                  # الوثائق
│   ├── README-TESTING.md
│   └── analyze-test-results.md
└── package.json          # إعدادات Node.js
```

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
2. انتقل إلى قسم الإعدادات
3. أدخل معلومات الشركة
4. أضف المخازن والفئات حسب الحاجة

#### إضافة المنتجات
1. انتقل إلى قسم المنتجات
2. اضغط "إضافة منتج"
3. املأ البيانات المطلوبة
4. حدد توزيع المخازن

#### استخدام نقطة البيع
1. انتقل إلى قسم المبيعات
2. اختر المخزن
3. أضف المنتجات إلى السلة
4. أكمل عملية البيع

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

ABUSLEMAN Arabic Inventory Management & Accounting System is a comprehensive solution designed specifically for Arabic businesses. The system provides a fully Arabic user interface with complete Right-to-Left (RTL) support.

### ✨ Key Features

- **Point of Sale (POS)**: Easy-to-use sales interface with multi-warehouse support
- **Inventory Management**: Multi-warehouse inventory tracking with automatic deduction
- **Invoice System**: Automated numbering (ABUSLEAN-SALE-XX / ABUSLEAN-PUR-XX)
- **Reporting**: Comprehensive sales, customer, supplier, and inventory reports
- **Category Management**: 16 comprehensive Arabic product categories
- **Multi-warehouse Support**: Distribute products across multiple warehouses
- **Arabic Interface**: Complete RTL support with Arabic localization

### 🚀 Quick Start

1. Clone the repository
2. Start a local web server
3. Open `http://localhost:3000` in your browser
4. Configure your company settings
5. Start managing your inventory!

### 🧪 Testing

Run automated tests with Playwright:
```bash
npm install && npm test
```

### 📁 Project Structure

- `index.html` - Main application file
- `js/` - JavaScript modules
- `tests/` - Playwright test files
- `docs/` - Documentation

### 🔧 Recent Fixes

- ✅ Automatic inventory deduction in POS
- ✅ Category synchronization across all sections
- ✅ Real-time updates without page refresh

### 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for Arabic businesses**

[⬆ Back to top](#نظام-إدارة-المخزون-والمحاسبة---أبوسليمان)

</div>
